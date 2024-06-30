use std::{sync::{mpsc::Sender, Arc}, time::Duration};
use std::collections::HashMap;

use message::DltMsg;
use rusty_time::Timer;
use serenity::all::{GuildId, Http, UserId};
use server::{Server, ServerChannelId, ServerGuildId, Servers, ServersLock};
use song::Song;
use songbird::typemap::TypeMapKey;
use sqlx::{query, Pool, Postgres};
use reqwest::Client as HttpClient;
use tokio::sync::Mutex;
use tracing::{error, info};

use crate::VC_DC_TIMEOUT_IN_SEC;

pub mod message;
pub mod server;
pub mod song;
pub mod checks;
pub mod embeds;

#[derive(Debug, Clone)]
pub struct UserData {
    pub inner: Arc<SmData>
}

impl UserData {
    pub fn new(data: SmData) -> Self {
        Self { inner: Arc::new(data) }
    }
}

impl TypeMapKey for UserData {
    type Value = UserData;
}

#[derive(Debug, Clone)]
pub struct SmData {
    pub reqwest: HttpClient,
    pub http: Arc<Mutex<Option<Arc<Http>>>>,
    pub songbird: Arc<songbird::Songbird>,
    pub db: Arc<Pool<Postgres>>,
    pub servers: Arc<Mutex<Servers>>,
    pub id: Arc<Mutex<UserId>>,
    pub client_tx: Arc<Sender<ClientChannel>>
}

impl SmData {
    /// update a server in the database and updates server cache aswell
    pub async fn update_server_db(&self, server: &Server) -> &Self {
        // servers_lock.0.entry(server.id.clone()).and_modify(|old_server| *old_server = server.clone());
        match query("UPDATE server SET songs = $1 WHERE server_id = $2")
            .bind(server.songs.clone())
            .bind(server.id.0.clone())
            .execute(&*self.db)
            .await
        {
            Ok(_) => info!("Server {} updated successfully", server.id.0),
            Err(err) => info!("Failed to update server {}: {}", server.id.0, err),
        };
        self
    }
    /// add a server to the database and add it to the cache aswell
    pub async fn add_server_db(&self, server: Server) -> &Self {
        match query("INSERT INTO server (server_id, channel_id, voice_channel_id, name, songs) VALUES ($1, $2, $3, $4, $5)")
            .bind(server.id.clone().0)
            .bind(server.channel_id.0.clone())
            .bind(server.voice_channel_id.0.clone())
            .bind(server.name.clone())
            .bind(server.songs.clone())
            .execute(&*self.db)
            .await
        {
            Ok(_) => info!("Server {} added successfully", server.id.0),
            Err(err) => info!("Failed to update server {}: {}", server.id.0, err),
        };
        // servers_lock.0.insert(server.id.clone(), server);
        self
    }
    /// gets all the servers from the database and updates the cache aswell
    /// 
    /// # Note
    /// 
    /// a server lock needs to be aquired and passed in as a reference into this method for better
    /// thread hygeine
    pub async fn get_servers_db(&self, servers_lock: &mut ServersLock<'_>) -> Servers {
        match query("SELECT * FROM server")
            .fetch_all(&*self.db)
            .await 
        {
            Ok(res) => {
                let mut servers = HashMap::new();
                for row in res.into_iter() {
                    let server = Server::from(row);
                    servers.insert(server.id.clone(), server);
                }
                **servers_lock = Servers(servers.clone());
                info!("{} Servers from DB aquired", servers.len());
                Servers(servers.clone())
            },
            Err(err) => panic!("Failed to aquire servers from DB {}", err),
        }
    }
    /// remove a server from the database and from the cache
    /// 
    /// # Note
    /// 
    /// a server lock needs to be aquired and passed in as a reference into this method for better
    /// thread hygeine
    pub async fn remove_server_db(&self, guild_id: &GuildId, servers_lock: &mut ServersLock<'_>) -> &Self {
        match query("DELETE FROM server WHERE server_id = $1")
            .bind(guild_id.to_string())
            .execute(&*self.db)
            .await
        {
            Ok(_) => info!("Removed server {} from db", guild_id.to_string()),
            // TODO do something usefull if we failed to remove server from DB for some reason
            Err(err) => info!("Failed to remove server {} from db: {}", guild_id.to_string(), err),
        }
        let channel_id = servers_lock.0.get_mut(&ServerGuildId::from(guild_id)).expect("Server should exist").channel_id.clone();
        servers_lock.0.remove(&ServerGuildId::from(guild_id));
        self.stop_dc_timer(ServerGuildId::from(guild_id), channel_id);
        self
    }
    /// attempts to get a specified server from the cache
    /// 
    /// # Note 
    /// 
    /// The [`Server`](crate::common::Server) does not mutate the internal server data in [`SmData`](crate::common::SmData)
    /// 
    /// if you want to mutate internal server data you can modify the server return from this function and pass it into update_server_db on [`SmData`](crate::common::SmData)
    // pub async fn get_server(&self, guild_id: &GuildId) -> Option<Server> {
    //     match self.servers.lock().await.0.get_mut(&ServerGuildId::from(guild_id)) {
    //         Some(server) => {
    //             Some(server.clone())
    //         },
    //         None => None,
    //     }
    // }
    /// Update the server in the cache and not in the db
    /// 
    /// # Note
    /// 
    /// a server lock needs to be aquired and passed in as a reference into this method for better
    /// thread hygeine
    pub async fn update_server(&self, server: Server, servers_lock: &mut ServersLock<'_>) {
        servers_lock.0.entry(server.id.clone()).and_modify(|old_server| *old_server = server);
    }
    pub async fn servers_unlocked(&self) -> ServersLock {
        self.servers.lock().await
    }
    /// Attempts to stop the player. This will stop the songbird [`Call`] player as well as update the [`AudioPlayerState`]
    pub async fn stop_player(&self, guild_id: &GuildId, servers_lock: &mut ServersLock<'_>) -> Result<(), ()> {
        let server = servers_lock.0.get_mut(&ServerGuildId::from(guild_id)).expect("Server should exist");

        if let Some(handler) = self.songbird.get(server.id.guild_id()) {
            handler.lock().await.stop();
            server.audio_player.stop();
            // self.update_server(server).await;
        }
        Ok(())
    }
    /// Attempts to advance the server queue to the next song. Returns [`Err`] if the server isn't in the cache
    /// 
    /// # Note
    /// 
    /// this doesn't advance the sonbird queue. it only advances the server queue
    pub async fn next_song(&self, guild_id: &GuildId) -> Result<(), String> {
        let mut servers = self.servers.lock().await;
        let server = match servers.0.get_mut(&ServerGuildId::from(guild_id)) {
            Some(server) => server,
            None => return Err("Server not found".to_string()),
        };
        if let Some(handler) = self.songbird.get(guild_id.clone()) {
            if let Err(err) = handler.lock().await.queue().skip() {
                println!("failed to skip song {}", err);
            }
            server.audio_player.skip();
            // self.update_server(server).await;
        }
        else {
            return Err("Not in a voice channel".to_string());
        }
        Ok(())
    }
    /// Attempts to start the servers curr_song. Returns [`Err`] if the server isn't in the cache
    /// 
    /// # Note
    /// 
    /// this doesn't start song in the sonbird queue. it only start the player in the the server queue
    pub async fn start_song(&self, guild_id: &GuildId) -> Result<(), ()> {
        let mut servers = self.servers.lock().await;
        let server = match servers.0.get_mut(&ServerGuildId::from(guild_id)) {
            Some(server) => server,
            None => return Err(()),
        };
        server.audio_player.play();
        // self.update_server(server).await;
        Ok(())
    }
    pub async fn curr_song(&self, guild_id: &GuildId) -> Option<Song> {
        let servers = self.servers.lock().await;
        match servers.0.get(&ServerGuildId::from(guild_id)) {
            Some(server) => server.songs.curr_song().cloned(),
            None => None,
        }
    }
    pub async fn print_servers(&self) {
        let servers = self.servers.lock().await;
        println!("{}", servers.0.len());
        for server in servers.0.iter() {
            println!("server.1.name {}", server.1.name);
        }
    }
    /// starts a dc timer for the current server. Will dc from the voice channel when the timer finishes
    pub fn start_dc_timer(&self, guild_id: ServerGuildId, channel_id: ServerChannelId) {
        match self.client_tx.send(ClientChannel::DcTimeOut(DcTimeOut {
            guild_id,
            channel_id,
            timer: Timer::new(Duration::from_secs(VC_DC_TIMEOUT_IN_SEC)),
            end: false 
        })) {
            Err(err) => error!("Failed to send start dc timeout event over client channel {}", err),
            _ => {}
        }
    }
    /// stops a dc timer for the current server.
    pub fn stop_dc_timer(&self, guild_id: ServerGuildId, channel_id: ServerChannelId) {
        match self.client_tx.send(ClientChannel::DcTimeOut(DcTimeOut {
            guild_id,
            channel_id,
            timer: Timer::new(Duration::from_secs(VC_DC_TIMEOUT_IN_SEC)),
            end: true 
        })) {
            Err(err) => error!("Failed to send stop dc timeout event over client channel {}", err),
            _ => {}
        }
    }
    /// initialized the bot with data from discord
    pub async fn init_bot(&self, id: UserId, http: Arc<Http>) {
        *self.id.lock().await = id;
        *self.http.lock().await = Some(Arc::clone(&http));
    }
}

#[derive(Debug, Clone)]
pub enum ClientChannel {
    DltMsg(DltMsg),
    DcTimeOut(DcTimeOut),
}

#[derive(Debug, Clone)]
pub struct DcTimeOut {
    pub guild_id: ServerGuildId,
    pub channel_id: ServerChannelId,
    pub timer: Timer,
    /// whether or not to end the timer
    pub end: bool
}