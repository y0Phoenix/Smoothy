use std::sync::{Arc, Mutex};
use std::collections::HashMap;

// YtDl requests need an HTTP client to operate -- we'll create and store our own.
use reqwest::Client as HttpClient;
use rusty_time::Timer;
use serde::{Serialize, Deserialize};
use serenity::all::*;
use sqlx::{postgres::PgRow, prelude::FromRow, query, Pool, Postgres, Row};
use tracing::info;

#[derive(Debug, Clone)]
pub struct DltMsg {
    pub msg: Box<Message>,
    pub duration: u64,
    pub timer: Timer
}

#[derive(Debug)]
pub struct SmData {
    pub http: HttpClient,
    pub songbird: Arc<songbird::Songbird>,
    pub db: Pool<Postgres>,
    pub servers: Arc<Mutex<Servers>>,
    pub dlt_msgs: Arc<Mutex<Vec<DltMsg>>>,
    pub id: Arc<Mutex<UserId>>
}

impl SmData {
    pub async fn update_server_db(&self, server: Server) -> &Self {
        match query("UPDATE server SET songs = $1 WHERE server_id = $2")
            .bind(server.songs.clone())
            .bind(server.id.clone())
            .execute(&self.db)
            .await
        {
            Ok(_) => info!("Server {} updated successfully", server.id),
            Err(err) => info!("Failed to update server {}: {}", server.id, err),
        };
        self.servers.lock().unwrap().0.entry(server.id.clone()).and_modify(|old_server| *old_server = server);
        self
    }
    pub async fn add_server_db(&self, server: Server) -> &Self {
        match query("INSERT INTO server (server_id, name, songs) VALUES ($1, $2, $3)")
            .bind(server.id.clone())
            .bind(server.name.clone())
            .bind(server.songs.clone())
            .execute(&self.db)
            .await
        {
            Ok(_) => info!("Server {} added successfully", server.id),
            Err(err) => info!("Failed to update server {}: {}", server.id, err),
        };
        let mut servers = self.servers.lock().unwrap();
        servers.0.insert(server.id.clone(), server);
        self
    }
    pub async fn get_servers_db(&self) -> &Self {
        match query("SELECT * FROM server")
            .fetch_all(&self.db)
            .await 
        {
            Ok(res) => {
                let mut servers = HashMap::new();
                for row in res.into_iter() {
                    let server = Server::from(row);
                    servers.insert(server.id.clone(), server);
                }
                *self.servers.lock().unwrap() = Servers(servers);
                info!("Servers from DB aquired");
                self
            },
            Err(err) => panic!("Failed to aquire servers from DB {}", err),
        }
    }
    pub async fn remove_server_db(&self, guild_id: &GuildId) -> &Self {
        match query("DELETE FROM server WHERE server_id = $1")
            .bind(guild_id.to_string())
            .execute(&self.db)
            .await
        {
            Ok(_) => info!("Removed server {} from db", guild_id.to_string()),
            // TODO do something usefull if we failed to remove server from DB for some reason
            Err(err) => info!("Failed to remove server {} from db: {}", guild_id.to_string(), err),
        }
        self.servers.lock().unwrap().0.remove(&guild_id.to_string());
        self
    }
    pub fn get_server(&self, guild_id: &GuildId) -> Option<Server> {
        match self.servers.lock().unwrap().0.get(&guild_id.to_string()) {
            Some(server) => Some(server.clone()),
            None => None,
        }
    }
    pub fn print_servers(&self) {
        let servers = self.servers.lock().unwrap();
        println!("{}", servers.0.len());
        for server in servers.0.iter() {
            println!("server.1.name {}", server.1.name);
        }
    }
    pub fn init_bot(&self, id: UserId) {
        *self.id.lock().unwrap() = id;
    }
}

#[derive(Debug)]
pub struct Servers(pub std::collections::HashMap<String, Server>);


#[derive(Debug, Default, FromRow, Serialize, Clone, Deserialize)]
pub struct Song {
    pub title: String,
    pub url: String,
    pub duration: String,
    pub thumbnail: String,
    pub requested_by: String
}

#[derive(Debug, Default, FromRow, Serialize, Clone, Deserialize)]
pub struct Songs(pub Vec<Song>);

impl Songs {
    pub fn add_song(&mut self, song: Song) -> &mut Self {
        self.0.push(song);
        self
    }
}

#[derive(Debug, Default, FromRow, Serialize, Clone)]
pub struct Server {
    pub id: String,
    pub name: String,
    pub songs: sqlx::types::Json<Songs>,
    // #[sqlx(skip)]
}

impl From<PgRow> for Server {
    fn from(value: PgRow) -> Self {
        Self { 
            name: value.get("name"),
            id: value.get("server_id"),
            songs: value.get("songs")
        }
    }
}

impl Server {
    pub fn add_song(&mut self, song: Song) -> &mut Self {
        self.songs.0.0.push(song);
        self
    }
}