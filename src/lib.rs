use std::str::FromStr;

use commands::play::start_song;
// use commands::play::play;
use common::{NowPlayingMsg, SmData, Song};
use executive::{send_msg, Generics};
use ::serenity::{all::{ChannelId, GuildId, MessageId}, async_trait};
use serenity::all as serenity;
// Event related imports to detect track creation failures.
use songbird::{events::{Event, EventContext, EventHandler as VoiceEventHandler}, Call, TrackEvent};
use tracing::{info, warn};

pub mod commands;
pub mod executive;
pub mod common;

pub type SmError = Box<dyn std::error::Error + Send + Sync>;
pub type SmContext<'a> = poise::Context<'a, SmData, SmError>;
pub type CommandResult = Result<(), SmError>;

pub const VC_DC_TIMEOUT_IN_SEC: u64 = 1800;

#[derive(Debug, Default)]
pub struct SmMsg {
    pub guild_id: GuildId,
    pub channel_id: ChannelId,
    pub content: String
}

pub struct TrackErrorNotifier;

#[serenity::async_trait]
impl VoiceEventHandler for TrackErrorNotifier {
    async fn act(&self, ctx: &EventContext<'_>) -> Option<Event> { 
        warn!("songbird event");
        if let EventContext::Track(track_list) = ctx {
            for (state, handle) in *track_list {
                println!(
                    "Track {:?} encountered an error: {:?}",
                    handle.uuid(),
                    state.playing
                );
            }
        }
        None
    }
}

pub struct SongEndEvent {
    pub generics: Generics,
}

#[async_trait]
impl VoiceEventHandler for SongEndEvent {
    async fn act(&self, ctx: &EventContext<'_>) -> Option<Event> {
        if let EventContext::Track(tracks) = ctx {
            let track = tracks.get(0).expect("Should be a track at 0");

            let typemap = track.1.typemap().read().await;
            let curr_song = typemap.get::<Song>().expect("Should have a song");
            let now_playing_msg = &curr_song.now_playing_msg.clone().expect("Should have a msg");
            
            let http = self.generics.data.http.lock().unwrap().clone().expect("Should be an Http initialized");

            let channel_id = ChannelId::from_str(now_playing_msg.channel_id.as_str()).expect("Should be valid ChannelId");
            if let Ok(msg) = channel_id.message(&http, MessageId::from_str(&now_playing_msg.msg_id).expect("Should be a valid MessageId")).await {
                if let Ok(_) = msg.delete(http).await {
                    info!("Message {} deleted", msg.id)
                }
            }

            let mut server = self.generics.data.get_server(&self.generics.guild_id).expect("Server should exist");
            // info!("song len {}", server.songs.0.0.len());
            server.songs.next_song();
            // info!("song len {}", server.songs.0.0.len());
            // stop the audio player to maintain state update
            server.audio_player.stop();
            let no_more_songs = server.songs.0.is_empty();
            if no_more_songs {
                send_msg(&self.generics, "No more songs to play :x:", Some(10000)).await;
                info!("No more songs to play in {} starting dc timeout", server.name);
                server.dc_timer_started = true;
            }
            self.generics.data.update_server_db(server).await;
            let server = self.generics.data.get_server(&self.generics.guild_id).expect("Shou");

            info!("{}", server.dc_timer_started);
        }
        None
    }
}

pub struct SongStartEvent {
    pub generics: Generics,
}

#[async_trait]
impl VoiceEventHandler for SongStartEvent {
    async fn act(&self, ctx: &EventContext<'_>) -> Option<Event> {
        // println!("playable event");
        if let EventContext::Track(tracks) = ctx {
            let track = tracks.get(0).expect("Should be a track at 0");

            let mut typemap = track.1.typemap().write().await;
            let curr_song = typemap.get_mut::<Song>().expect("Should have a song");
            let mut server = self.generics.data.get_server(&self.generics.guild_id).expect("Server should exist");
            server.dc_timer_started = false;
            server.audio_player.play();
            // let curr_song = server.songs.curr_song().unwrap();
            if let Some(msg) = send_msg(&self.generics, format!("Now Playing {}", curr_song.title).as_str(), None).await {
                curr_song.now_playing_msg = Some(NowPlayingMsg {
                    channel_id: msg.channel_id.to_string(),
                    msg_id: msg.id.to_string()
                });
            }
            self.generics.data.update_server_db(server).await;
        }
        None
    }
}

pub struct SongPlayEvent {
    pub generics: Generics,
}

#[async_trait]
impl VoiceEventHandler for SongPlayEvent {
    async fn act(&self, ctx: &EventContext<'_>) -> Option<Event> {
        // println!("playable event");
        if let EventContext::Track(_tracks) = ctx {
            let track = _tracks.get(0).expect("Should be a track at 0");

            let typemap = track.1.typemap().read().await;
            let curr_song = typemap.get::<Song>().expect("Should have a song");
            let mut server = self.generics.data.get_server(&self.generics.guild_id).expect("Server should exist");
            server.audio_player.play();
            // let curr_song = server.songs.curr_song().unwrap();
            send_msg(&self.generics, format!("Now Playing {}", curr_song.title).as_str(), Some(10000)).await;
            self.generics.data.update_server_db(server).await;
        }
        None
    }
}

pub fn add_global_events(mut handler: tokio::sync::MutexGuard<Call>, _generics: &Generics) {
    handler.add_global_event(TrackEvent::Error.into(), TrackErrorNotifier);
    // handler.add_global_event(Event::Track(TrackEvent::End), SongEndEvent {
    //     generics: generics.clone().into()
    // });
    // handler.add_global_event(Event::Track(TrackEvent::Playable), SongStartEvent {
    //     generics: generics.clone().into()
    // });
}

/// global event handler for discord
pub async fn event_handler(
    ctx: &serenity::Context,
    event: &serenity::FullEvent,
    _framework: poise::FrameworkContext<'_, SmData, SmError>,
    data: &SmData,
) -> Result<(), SmError> {
    match event {
        serenity::FullEvent::Ready { data_about_bot, .. } => {
            data.init_bot(data_about_bot.user.id, ctx.http.clone());
            let servers = data.get_servers_db().await;
            for (_, server) in servers.0.iter() {
                let guild_id = GuildId::from_str(&server.id).expect("Should be a valid GuildId from DB");
                if server.songs.0.is_empty() {
                    data.remove_server_db(&guild_id).await;
                }
                data.add_generic(&server);
                let generics = data.get_generics(&guild_id).expect("Generic should exist");
                let voice_channel_id = ChannelId::from_str(&server.voice_channel_id).expect("Should be valid VoiceChannelId");
                if let Some(song) = server.songs.curr_song() {
                    let manager = &data.songbird;
                    if let Ok(handler_lock) = manager.join(generics.guild_id, voice_channel_id).await {
                        // Attach an event handler to see notifications of all track errors.
                        let handler = handler_lock.lock().await;
                        add_global_events(handler, &generics);
                    }
                    start_song(commands::play::SongType::DB(song), &generics).await.unwrap();
                }
            }
            println!("Logged in as {} id: {}", data_about_bot.user.name, data.id.lock().unwrap());
        },
        // on voice channel disconnect
        serenity::FullEvent::VoiceStateUpdate { old: _, new } => {
            // let cache = _ctx.cache().unwrap().guild(new.guild_id.unwrap()).unwrap();
            if new.channel_id.is_none() {
                let guild_id = new.guild_id.expect("Should have guild_id");
                if new.member.clone().unwrap().user.id == data.id.lock().unwrap().clone() {
                    data.remove_server_db(&guild_id).await;
                }
            }
        },
        _ => {}
    };
    Ok(())
}