use std::sync::{mpsc::Sender, Arc};
use std::collections::HashMap;

use message::DltMsg;
use rusty_time::Timer;
use serenity::all::{GuildId, Http, UserId};
use server::{Server, ServerChannelId, ServerGuildId, Servers};
use song::Song;
use songbird::typemap::TypeMapKey;
use sqlx::{query, Pool, Postgres};
use reqwest::Client as HttpClient;
use tokio::sync::Mutex;
use tracing::info;

pub mod message;
pub mod server;
pub mod song;
pub mod checks;

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
    pub async fn update_server_db(&self, server: Server) -> &Self {
        match query("UPDATE server SET songs = $1 WHERE server_id = $2")
            .bind(server.songs.clone())
            .bind(server.id.0.clone())
            .execute(&*self.db)
            .await
        {
            Ok(_) => info!("Server {} updated successfully", server.id.0),
            Err(err) => info!("Failed to update server {}: {}", server.id.0, err),
        };
        self.servers.lock().await.0.entry(server.id.clone()).and_modify(|old_server| *old_server = server);
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
        let mut servers = self.servers.lock().await;
        servers.0.insert(server.id.clone(), server);
        self
    }
    /// gets all the servers from the database and updates the cache aswell
    pub async fn get_servers_db(&self) -> Servers {
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
                *self.servers.lock().await = Servers(servers.clone());
                info!("{} Servers from DB aquired", servers.len());
                Servers(servers.clone())
            },
            Err(err) => panic!("Failed to aquire servers from DB {}", err),
        }
    }
    /// remove a server from the database and from the cache
    pub async fn remove_server_db(&self, guild_id: &GuildId) -> &Self {
        match query("DELETE FROM server WHERE server_id = $1")
            .bind(guild_id.to_string())
            .execute(&*self.db)
            .await
        {
            Ok(_) => info!("Removed server {} from db", guild_id.to_string()),
            // TODO do something usefull if we failed to remove server from DB for some reason
            Err(err) => info!("Failed to remove server {} from db: {}", guild_id.to_string(), err),
        }
        self.servers.lock().await.0.remove(&ServerGuildId::from(guild_id));
        self.client_tx.send(ClientChannel::DcTimeOut(DcTimeOut { 
            guild_id: ServerGuildId::from(guild_id),
            channel_id: ServerChannelId::default(),
            timer: Timer::default(),
            end: true }
        )).expect("Should be able to send on client_tx channel");
        self
    }
    /// attempts to get a specified server from the cache
    /// 
    /// # Note 
    /// 
    /// The [`Server`](crate::common::Server) does not mutate the internal server data in [`SmData`](crate::common::SmData)
    /// 
    /// if you want to mutate internal server data you can modify the server return from this function and pass it into update_server_db on [`SmData`](crate::common::SmData)
    pub async fn get_server(&self, guild_id: &GuildId) -> Option<Server> {
        match self.servers.lock().await.0.get_mut(&ServerGuildId::from(guild_id)) {
            Some(server) => Some(server.clone()),
            None => None,
        }
    }
    /// Update the server in the cache and not in the db
    pub async fn update_server(&self, server: Server) {
        self.servers.lock().await.0.entry(server.id.clone()).and_modify(|old_server| *old_server = server);
    }
    /// Attempts to stop the player. This will stop the songbird [`Call`] player as well as update the [`AudioPlayerState`]
    pub async fn stop_player(&self, guild_id: &GuildId) -> Result<(), ()> {
        let mut server = self.get_server(guild_id).await.expect("Server should exist");

        if let Some(handler) = self.songbird.get(server.id.guild_id()) {
            handler.lock().await.stop();
            server.audio_player.stop();
            self.update_server(server).await;
        }
        Ok(())
    }
    /// Attempts to advance the server queue to the next song. Returns [`Err`] if the server isn't in the cache
    /// 
    /// # Note
    /// 
    /// this doesn't advance the sonbird queue. it only advances the server queue
    pub async fn next_song(&self, guild_id: &GuildId) -> Result<(), String> {
        let mut server = match self.get_server(guild_id).await {
            Some(server) => server,
            None => return Err("Server not found".to_string()),
        };
        if let Some(handler) = self.songbird.get(guild_id.clone()) {
            if let Err(err) = handler.lock().await.queue().skip() {
                println!("failed to skip song {}", err);
            }
            server.audio_player.skip();
            self.update_server(server).await;
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
        let mut server = match self.get_server(guild_id).await {
            Some(server) => server,
            None => return Err(()),
        };
        server.audio_player.play();
        self.update_server(server).await;
        Ok(())
    }
    pub async fn curr_song(&self, guild_id: &GuildId) -> Option<Song> {
        let server = match self.get_server(guild_id).await {
            Some(server) => server,
            None => return None,
        };
        server.songs.curr_song()
    }
    pub async fn print_servers(&self) {
        let servers = self.servers.lock().await;
        println!("{}", servers.0.len());
        for server in servers.0.iter() {
            println!("server.1.name {}", server.1.name);
        }
    }
    /// starts a dc timer for the current server. Will dc from the voice channel when the timer finishes 
    pub async fn start_dc_timer(&self, guild_id: &GuildId) -> Result<(), ()>{
        let binding = self.servers.lock().await;
        let mut server = binding.0.get(&ServerGuildId::from(guild_id)).expect("Server should exist from start_dc_timer").clone();
        server.dc_timer_started = true;
        self.update_server(server).await;

        Ok(())
    }
    /// stops a dc timer for the current server.
    pub async fn stop_dc_timer(&self, guild_id: &GuildId) -> Result<(), ()>{
        let binding = self.servers.lock().await;
        let mut server = binding.0.get(&ServerGuildId::from(guild_id)).expect("Server should exist from stop_dc_timer").clone();
        server.dc_timer_started = false;
        self.update_server(server).await;

        Ok(())
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