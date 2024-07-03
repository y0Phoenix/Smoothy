use std::str::FromStr;

use serde::{Deserialize, Serialize};
use serenity::all::{ChannelId, GuildId};
use sqlx::{postgres::PgRow, prelude::FromRow, Row};
use tokio::sync::MutexGuard;
use tracing::info;

use super::song::{Song, Songs};

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
        matches!(self, Self::Playing)
    }
    pub fn is_idle(&self) -> bool {
        matches!(self, Self::Idle)
    }
    pub fn is_pause(&self) -> bool {
        matches!(self, Self::Paused)
    }
}

#[derive(Debug, Default, FromRow, Serialize, Clone, Deserialize, PartialEq, Eq, Hash)]
pub struct ServerChannelId(pub String);

impl From<ServerChannelId> for ChannelId {
    fn from(value: ServerChannelId) -> Self {
        ChannelId::from_str(&value.0).expect("Invalid ChannelId supplied")
    }
}

impl ServerChannelId {
    /// will convert the string channelid into a ChannelId
    pub fn channel_id(&self) -> ChannelId {
        ChannelId::from_str(&self.0).expect("Invalid ChannelId supplied")
    }
}

impl From<&ChannelId> for ServerChannelId {
    fn from(value: &ChannelId) -> Self {
        Self(value.to_string())
    }
}

impl From<ChannelId> for ServerChannelId {
    fn from(value: ChannelId) -> Self {
        Self(value.to_string())
    }
}

#[derive(Debug, Default, FromRow, Serialize, Clone, Deserialize, PartialEq, Eq, Hash)]
pub struct ServerGuildId(pub String);

impl From<ServerGuildId> for GuildId {
    fn from(value: ServerGuildId) -> Self {
        GuildId::from_str(&value.0).expect("Invalid GuildId supplied")
    }
}

impl ServerGuildId {
    /// will convert the string guildid into a GuildId
    pub fn guild_id(&self) -> GuildId {
        GuildId::from_str(&self.0).expect("Invalid GuildId supplied")
    }
}

impl From<&GuildId> for ServerGuildId {
    fn from(value: &GuildId) -> Self {
        Self(value.to_string())
    }
}

impl From<GuildId> for ServerGuildId {
    fn from(value: GuildId) -> Self {
        Self(value.to_string())
    }
}


#[derive(Debug)]
pub struct Servers(pub std::collections::HashMap<ServerGuildId, Server>);

pub type ServersLock<'a> = MutexGuard<'a, Servers>;

#[derive(Debug, Default, FromRow, Serialize, Clone)]
pub struct Server {
    // because of how this API has to work with aquiring 
    pub locked: bool,
    pub id: ServerGuildId,
    pub channel_id: ServerChannelId,
    pub voice_channel_id: ServerChannelId,
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
            id: ServerGuildId(value.get("server_id")),
            channel_id: ServerChannelId(value.get("channel_id")),
            voice_channel_id: ServerChannelId(value.get("voice_channel_id")),
            name: value.get("name"),
            songs: value.get("songs"),
            ..Default::default()
        }
    }
}

impl Server {
    pub fn add_song(&mut self, song: Song) -> &mut Self {
        self.songs.0.songs.push(song);
        self
    }
}