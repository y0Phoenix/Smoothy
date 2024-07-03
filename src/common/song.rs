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
    pub looped: bool
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
        self.songs.get(0)
    }
    pub fn curr_song_mut(&mut self) -> Option<&mut Song> {
        self.songs.get_mut(0)
    }
}