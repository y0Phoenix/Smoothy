use std::{str::FromStr, sync::{Arc, Mutex}};
use std::collections::HashMap;

use prelude::TypeMapKey;
// YtDl requests need an HTTP client to operate -- we'll create and store our own.
use reqwest::Client as HttpClient;
use rusty_time::Timer;
use serde::{Serialize, Deserialize};
use serenity::all::*;
use sqlx::{postgres::PgRow, prelude::FromRow, query, Pool, Postgres, Row};
use tracing::info;

use crate::executive::{get_audio_player_handler, Generics};

#[derive(Debug, Clone)]
pub struct DltMsg {
    pub msg: Box<Message>,
    pub duration: u64,
    pub timer: Timer
}

#[derive(Debug, Clone)]
pub struct SmData {
    pub reqwest: HttpClient,
    pub http: Arc<Mutex<Option<Arc<Http>>>>,
    pub songbird: Arc<songbird::Songbird>,
    pub db: Arc<Pool<Postgres>>,
    pub servers: Arc<Mutex<Servers>>,
    pub generics: Arc<Mutex<std::collections::HashMap<String, Generics>>>,
    pub dlt_msgs: Arc<Mutex<Vec<DltMsg>>>,
    pub id: Arc<Mutex<UserId>>
}

impl SmData {
    /// update a server in the database and updates server cache aswell
    pub async fn update_server_db(&self, server: Server) -> &Self {
        match query("UPDATE server SET songs = $1 WHERE server_id = $2")
            .bind(server.songs.clone())
            .bind(server.id.clone())
            .execute(&*self.db)
            .await
        {
            Ok(_) => info!("Server {} updated successfully", server.id),
            Err(err) => info!("Failed to update server {}: {}", server.id, err),
        };
        self.servers.lock().unwrap().0.entry(server.id.clone()).and_modify(|old_server| *old_server = server);
        self
    }
    /// add a server to the database and add it to the cache aswell
    pub async fn add_server_db(&self, server: Server) -> &Self {
        match query("INSERT INTO server (server_id, channel_id, voice_channel_id, name, songs) VALUES ($1, $2, $3, $4, $5)")
            .bind(server.id.clone())
            .bind(server.channel_id.clone())
            .bind(server.voice_channel_id.clone())
            .bind(server.name.clone())
            .bind(server.songs.clone())
            .execute(&*self.db)
            .await
        {
            Ok(_) => info!("Server {} added successfully", server.id),
            Err(err) => info!("Failed to update server {}: {}", server.id, err),
        };
        let mut servers = self.servers.lock().unwrap();
        self.add_generic(&server);
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
                *self.servers.lock().unwrap() = Servers(servers.clone());
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
        self.servers.lock().unwrap().0.remove(&guild_id.to_string());
        self.generics.lock().unwrap().remove(&guild_id.to_string());
        self
    }
    /// attempts to get a specified server from the cache
    /// 
    /// # Note 
    /// 
    /// The [`Server`](crate::common::Server) does not mutate the internal server data in [`SmData`](crate::common::SmData)
    /// 
    /// if you want to mutate internal server data you can modify the server return from this function and pass it into update_server_db on [`SmData`](crate::common::SmData)
    pub fn get_server(&self, guild_id: &GuildId) -> Option<Server> {
        match self.servers.lock().unwrap().0.get_mut(&guild_id.to_string()) {
            Some(server) => Some(server.clone()),
            None => None,
        }
    }
    /// Update the server in the cache and not in the db
    pub fn update_server(&self, server: Server) {
        self.servers.lock().unwrap().0.entry(server.id.clone()).and_modify(|old_server| *old_server = server);
    }
    /// adds a generic to the generics pool
    pub fn add_generic(&self, server: &Server) {
        self.generics.lock().unwrap().insert(server.id.clone(), Generics { 
            channel_id: ChannelId::from_str(&server.channel_id).expect("ChannelId should be valid"),
            data: Arc::new(self.clone()),
            guild_id: GuildId::from_str(&server.id).expect("GuildId should be valid") 
        });
    }
    /// gets the specified generic for the guild from the generics pool
    pub fn get_generics(&self, guild_id: &GuildId) -> Option<Generics> {
        self.generics.lock().unwrap().get(&guild_id.to_string()).cloned()
    }
    /// Attempts to stop the player. This will stop the songbird [`Call`] player as well as update the [`AudioPlayerState`]
    pub async fn stop_player(&self, guild_id: &GuildId) -> Result<(), ()> {
        let mut server = self.get_server(guild_id).expect("Server should exist");

        let handle = match get_audio_player_handler(&self.get_generics(guild_id).expect("Generic should exist")).await {
            Some(handle) => handle,
            None => return Err(()),
        };

        handle.lock().await.stop();
        server.audio_player.stop();
        self.update_server(server);

        Ok(())
    }
    /// Attempts to advance the server queue to the next song. Returns [`Err`] if the server isn't in the cache
    /// 
    /// # Note
    /// 
    /// this doesn't advance the sonbird queue. it only advances the server queue
    pub async fn next_song(&self, guild_id: &GuildId) -> Result<(), ()> {
        let mut server = match self.get_server(guild_id) {
            Some(server) => server,
            None => return Err(()),
        };
        let handle = match get_audio_player_handler(&self.get_generics(guild_id).expect("Generic should exist")).await {
            Some(handle) => handle,
            None => return Err(()),
        };
        if let Err(err) = handle.lock().await.queue().skip() {
            println!("{}", err);
        }
        server.audio_player.skip();
        self.update_server(server);
        Ok(())
    }
    /// Attempts to start the servers curr_song. Returns [`Err`] if the server isn't in the cache
    /// 
    /// # Note
    /// 
    /// this doesn't start song in the sonbird queue. it only start the player in the the server queue
    pub fn start_song(&self, guild_id: &GuildId) -> Result<(), ()> {
        let mut server = match self.get_server(guild_id) {
            Some(server) => server,
            None => return Err(()),
        };
        server.audio_player.play();
        self.update_server(server);
        Ok(())
    }
    pub fn curr_song(&self, guild_id: &GuildId) -> Option<Song> {
        let server = match self.get_server(guild_id) {
            Some(server) => server,
            None => return None,
        };
        server.songs.curr_song()
    }
    pub fn print_servers(&self) {
        let servers = self.servers.lock().unwrap();
        println!("{}", servers.0.len());
        for server in servers.0.iter() {
            println!("server.1.name {}", server.1.name);
        }
    }
    /// starts a dc timer for the current server. Will dc from the voice channel when the timer finishes 
    pub fn start_dc_timer(&self, guild_id: &GuildId) -> Result<(), ()>{
        let binding = self.servers.lock().unwrap();
        let mut server = binding.0.get(&guild_id.to_string()).expect("Server should exist from start_dc_timer").clone();
        server.dc_timer_started = true;
        self.update_server(server);

        Ok(())
    }
    /// stops a dc timer for the current server.
    pub fn stop_dc_timer(&self, guild_id: &GuildId) -> Result<(), ()>{
        let binding = self.servers.lock().unwrap();
        let mut server = binding.0.get(&guild_id.to_string()).expect("Server should exist from stop_dc_timer").clone();
        server.dc_timer_started = false;
        self.update_server(server);

        Ok(())
    }
    /// initialized the bot with data from discord
    pub fn init_bot(&self, id: UserId, http: Arc<Http>) {
        *self.id.lock().unwrap() = id;
        *self.http.lock().unwrap() = Some(Arc::clone(&http));
    }
}

#[derive(Debug)]
pub struct Servers(pub std::collections::HashMap<String, Server>);

#[derive(Debug, Default, FromRow, Serialize, Clone, Deserialize)]
pub struct NowPlayingMsg {
    pub channel_id: String,
    pub msg_id: String
}

#[derive(Debug, Default, FromRow, Serialize, Clone, Deserialize)]
pub struct Song {
    pub title: String,
    pub url: String,
    pub duration_in_sec: u64,
    pub thumbnail: String,
    pub requested_by: String,
    pub now_playing_msg: Option<NowPlayingMsg>
}

impl TypeMapKey for Song {
    type Value = Song;
}

#[derive(Debug, Default, FromRow, Serialize, Clone, Deserialize)]
pub struct Songs(pub Vec<Song>);

impl Songs {
    pub fn add_song(&mut self, song: Song) -> &mut Self {
        self.0.push(song);
        self
    }
    pub fn next_song(&mut self) -> &mut Self {
        if !self.0.is_empty() {
            self.0.remove(0);
        }
        self
    }
    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }  
    pub fn curr_song(&self) -> Option<Song> {
        self.0.get(0).cloned()
    }
}

#[derive(Debug, Default, Serialize, Clone)]
pub struct AudioPlayer {
    pub state: AudioPlayerState,
}

impl AudioPlayer {
    pub fn stop(&mut self) {
        self.update_state(AudioPlayerState::Idle)
    }
    pub fn play(&mut self) {
        self.update_state(AudioPlayerState::Playing)
    }
    pub fn pause(&mut self) {
        self.update_state(AudioPlayerState::Paused)
    }
    pub fn skip(&mut self) {
        self.update_state(AudioPlayerState::Skipped)
    }
    fn update_state(&mut self, state: AudioPlayerState) {
        info!("New AudioPlayerState {:?}", state);
        self.state = state;
    }
}

#[derive(Debug, Default, Serialize, Clone)]
pub enum AudioPlayerState {
    Playing,
    #[default]
    Idle,
    Paused,
    Skipped,
}

impl AudioPlayerState {
    pub fn is_playing(&self) -> bool {
        match self {
            Self::Playing => true,
            _ => false
        }
    }
    pub fn is_idle(&self) -> bool {
        match self {
            Self::Idle => true,
            _ => false
        }
    }
    pub fn is_pause(&self) -> bool {
        match self {
            Self::Paused => true,
            _ => false
        }
    }
}

#[derive(Debug, Default, FromRow, Serialize, Clone)]
pub struct Server {
    pub id: String,
    pub channel_id: String,
    pub voice_channel_id: String,
    pub name: String,
    pub songs: sqlx::types::Json<Songs>,
    #[sqlx(skip)]
    pub audio_player: AudioPlayer,
    /// if the vc dc timer should be ticking
    pub dc_timer_started: bool
}

impl From<PgRow> for Server {
    fn from(value: PgRow) -> Self {
        Self { 
            id: value.get("server_id"),
            channel_id: value.get("channel_id"),
            voice_channel_id: value.get("voice_channel_id"),
            name: value.get("name"),
            songs: value.get("songs"),
            ..Default::default()
        }
    }
}

impl Server {
    pub fn add_song(&mut self, song: Song) -> &mut Self {
        self.songs.0.0.push(song);
        self
    }
}