use serde::{Deserialize, Serialize};
use songbird::typemap::TypeMapKey;
use sqlx::prelude::FromRow;

use super::message::NowPlayingMsg;

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