use std::sync::{Arc, Mutex};

// YtDl requests need an HTTP client to operate -- we'll create and store our own.
use reqwest::Client as HttpClient;
use rusty_time::Timer;
use serenity::all::*;
use sqlx::{prelude::FromRow, Pool, Postgres};

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
    pub server: Server,
    pub dlt_msgs: Arc<Mutex<Vec<DltMsg>>>
}

#[derive(Debug, Default, FromRow)]
pub struct Song {
    pub name: String,
    pub url: String,
    pub duration: String,
    pub thumbnail: String,
    pub requested_by: String
}

#[derive(Debug, Default, FromRow)]
pub struct Server {
    pub id: String,
    pub name: String,
    pub songs: Vec<Song>,
    #[sqlx(skip)]
    pub guild: Guild
}