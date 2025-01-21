use std::{sync::Arc, time::Instant};

use rusty_ytdl::{search::SearchResult, Video};
use serde::{Deserialize, Serialize};
use songbird::{input::YoutubeDl, typemap::TypeMapKey};
use sqlx::prelude::FromRow;
use url::Url;

use super::{generics::Generics, message::NowPlayingMsg, SmData};

#[derive(Debug, Default, FromRow, Serialize, Clone, Deserialize)]
pub struct Song {
    pub title: String,
    pub url: String,
    pub duration_in_sec: u64,
    pub thumbnail: String,
    pub requested_by: String,
    pub now_playing_msg: Option<NowPlayingMsg>,
}

impl TypeMapKey for Song {
    type Value = Song;
}

impl Song {
    pub fn duration_formatted(&self) -> String {
        let hour = self.duration_in_sec / 3600;
        let minute = (self.duration_in_sec % 3600) / 60;
        let second = self.duration_in_sec % 60;

        if hour > 0 {
            format!("{:02}:{:02}:{:02}", hour, minute, second)
        } else {
            format!("{:02}:{:02}", minute, second)
        }
    }
}

#[derive(Debug, Default, FromRow, Serialize, Clone, Deserialize)]
pub struct Songs {
    pub songs: Vec<Song>,
    /// if the queue is looped
    pub looped: bool,
}

impl Songs {
    pub fn add_song(&mut self, song: Song) -> &mut Self {
        self.songs.push(song);
        self
    }
    pub fn next_song(&mut self) -> &mut Self {
        if !self.songs.is_empty() {
            self.songs.remove(0);
        }
        self
    }
    pub fn is_empty(&self) -> bool {
        self.songs.is_empty()
    }
    pub fn curr_song(&self) -> Option<&Song> {
        self.songs.first()
    }
    pub fn curr_song_mut(&mut self) -> Option<&mut Song> {
        self.songs.first_mut()
    }
}

pub async fn search_song(
    song: String,
    data: &Arc<SmData>,
) -> Result<YoutubeDl, ()> {
    let instant = Instant::now();
    if Url::parse(&song).is_ok() {
        let video = Video::new(song.clone()).unwrap();
        let video = video.get_basic_info().await.unwrap();
        println!("{} elapsed {}", video.video_details.title, instant.elapsed().as_millis());
        return Ok(YoutubeDl::new(data.reqwest.clone(), video.video_details.video_url));
    }
    let youtube = rusty_ytdl::search::YouTube::new().unwrap();
    let video = youtube.search(song.clone(), None).await.unwrap();
    println!("{}", video.len());
    if let Some(SearchResult::Video(video)) = video.first() {
        println!("{} elapsed {}", video.title, instant.elapsed().as_millis());
        return Ok(YoutubeDl::new(data.reqwest.clone(), video.url.clone()));
    }
    Err(())
}

#[derive(Debug, Clone)]
pub enum SongType {
    /// if the song is a new play request. the first parameter is the youtube query which can also be a url. second parameter is the requested by which is the author of the request  
    New(String, String),
    /// if the song is from the DB and being initialed from there
    DB(Song),
}

#[derive(Debug, Clone)]
pub struct TrackMetaData {
    pub song: Song,
    pub generics: Generics,
    /// if the song is looped
    pub looped: bool,
    pub src: YoutubeDl,
}

impl TypeMapKey for TrackMetaData {
    type Value = TrackMetaData;
}
