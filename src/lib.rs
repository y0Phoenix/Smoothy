use std::{str::FromStr, sync::{mpsc::Sender, Arc}, time::Duration};

use commands::play::search_song;
use common::{message::{send_msg, NowPlayingMsg}, song::Song, ClientChannel, DcTimeOut, UserData};
use executive::init_track;
use rusty_time::Timer;
use ::serenity::{all::{ChannelId, GuildId, Http, MessageId}, async_trait};
use serenity::all as serenity;
// Event related imports to detect track creation failures.
use songbird::{events::{Event, EventContext, EventHandler as VoiceEventHandler}, typemap::TypeMapKey, Call, TrackEvent};
use tracing::{info, warn};

pub mod commands;
pub mod executive;
pub mod common;

pub type SmError = Box<dyn std::error::Error + Send + Sync>;
pub type SmContext<'a> = poise::Context<'a, UserData, SmError>;
pub type CommandResult = Result<(), SmError>;

pub const VC_DC_TIMEOUT_IN_SEC: u64 = 1800;

#[derive(Debug, Default)]
pub struct SmMsg {
    pub guild_id: GuildId,
    pub channel_id: ChannelId,
    pub content: String
}

#[derive(Debug, Clone)]
pub struct TrackMetaData {
    pub song: Song,
    pub generics: Generics,
    pub client_tx: Arc<Sender<ClientChannel>>
}

impl TypeMapKey for TrackMetaData {
    type Value = TrackMetaData;
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


//TODO make Play event for songs
pub struct SongEndEvent;

#[async_trait]
impl VoiceEventHandler for SongEndEvent {
    async fn act(&self, ctx: &EventContext<'_>) -> Option<Event> {
        if let EventContext::Track(tracks) = ctx {
            let track = tracks.get(0).expect("Should be a track at 0");

            let typemap = track.1.typemap().read().await;
            let meta_data = typemap.get::<TrackMetaData>().expect("Should have metadata");
            let now_playing_msg = &meta_data.song.now_playing_msg.clone().expect("Should have a msg");
            
            let http = meta_data.generics.data.inner.http.lock().await.clone().expect("Should be an Http initialized");

            let channel_id = ChannelId::from_str(now_playing_msg.channel_id.as_str()).expect("Should be valid ChannelId");
            if let Ok(msg) = channel_id.message(&http, MessageId::from_str(&now_playing_msg.msg_id).expect("Should be a valid MessageId")).await {
                if let Ok(_) = msg.delete(http).await {
                    info!("Message {} deleted", msg.id)
                }
            }

            let mut server = meta_data.generics.data.inner.get_server(&meta_data.generics.guild_id).await.expect("Server should exist");
            // info!("song len {}", server.songs.0.0.len());
            server.songs.next_song();
            // info!("song len {}", server.songs.0.0.len());
            // stop the audio player to maintain state update
            server.audio_player.stop();
            let no_more_songs = server.songs.0.is_empty();
            if no_more_songs {
                send_msg(&meta_data.generics, "No more songs to play :x:", Some(10000)).await;
                info!("No more songs to play in {} starting dc timeout", server.name);
                meta_data.client_tx.send(ClientChannel::DcTimeOut(DcTimeOut { 
                    guild_id: server.id.clone(),
                    channel_id: server.channel_id.clone(),
                    timer: Timer::new(Duration::from_secs(VC_DC_TIMEOUT_IN_SEC)),
                    end: false
                })).expect("Should be able to send on client tx");
            }
            meta_data.generics.data.inner.update_server_db(server).await;
        }
        None
    }
}

pub struct SongStartEvent;

#[async_trait]
impl VoiceEventHandler for SongStartEvent {
    async fn act(&self, ctx: &EventContext<'_>) -> Option<Event> {
        // println!("playable event");
        if let EventContext::Track(tracks) = ctx {
            let track = tracks.get(0).expect("Should be a track at 0");

            let mut typemap = track.1.typemap().write().await;
            let meta_data = typemap.get_mut::<TrackMetaData>().expect("Should have metadata");
            let mut server = meta_data.generics.data.inner.get_server(&meta_data.generics.guild_id).await.expect("Server should exist");
            server.dc_timer_started = false;
            server.audio_player.play();
            // let curr_song = server.songs.curr_song().unwrap();
            if let Some(msg) = send_msg(&meta_data.generics, format!("Now Playing {}", meta_data.song.title).as_str(), None).await {
                meta_data.song.now_playing_msg = Some(NowPlayingMsg {
                    channel_id: msg.channel_id.to_string(),
                    msg_id: msg.id.to_string()
                });
            }
            meta_data.generics.data.inner.update_server_db(server).await;
        }
        None
    }
}

pub fn add_global_events(handler: &mut tokio::sync::MutexGuard<Call>, _generics: &Generics) {
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
    _framework: poise::FrameworkContext<'_, UserData, SmError>,
    data: &UserData,
) -> Result<(), SmError> {
    match event {
        
        serenity::FullEvent::Ready { data_about_bot, .. } => {
            data.inner.init_bot(data_about_bot.user.id, ctx.http.clone()).await;
            let servers = data.inner.get_servers_db().await;
            for (_, server) in servers.0.iter() {
                let guild_id = server.id.clone().guild_id();
                if server.songs.0.is_empty() {
                    data.inner.remove_server_db(&guild_id).await;
                    continue;
                }
                let generics = Generics::from_user_data(data, &guild_id).await;
                let voice_channel_id = server.voice_channel_id.clone().channel_id();
                if let Some(_) = server.songs.curr_song() {
                    let manager = &data.inner.songbird;
                    if let Ok(handler_lock) = manager.join(generics.guild_id, voice_channel_id).await {
                        // Attach an event handler to see notifications of all track errors.
                        let mut handler = handler_lock.lock().await;
                        add_global_events(&mut handler, &generics);
                        for song in server.songs.0.0.iter() {
                            let src = search_song(song.url.clone(), &generics.data.inner);
                            let track = handler.enqueue(src.into()).await;

                            init_track(&song, &generics, track).await;
                        }
                    }
                }
            }
            println!("Logged in as {} id: {}", data_about_bot.user.name, data.inner.id.lock().await);
        },
        // on voice channel disconnect
        serenity::FullEvent::VoiceStateUpdate { old: _, new } => {
            // let cache = _ctx.cache().unwrap().guild(new.guild_id.unwrap()).unwrap();
            if new.channel_id.is_none() {
                let guild_id = new.guild_id.expect("Should have guild_id");
                if new.member.clone().unwrap().user.id == data.inner.id.lock().await.clone() {
                    data.inner.remove_server_db(&guild_id).await;
                }
            }
        },
        // serenity::FullEvent::Message { new_message } => {
        //     // FrameworkContext contains all data that poise::Framework usually manages
        //     let shard_manager = (*_framework.shard_manager).clone();
        //     let framework_data = poise::FrameworkContext {
        //         bot_id: *data.inner.id.lock().unwrap(),
        //         options: &_framework.options,
        //         user_data: data,
        //         shard_manager: &shard_manager,
        //     };

        //     let event = serenity::FullEvent::Message { new_message: new_message.clone() };
        //     poise::dispatch_event(framework_data, &ctx, event).await;
        // },
        _ => {}
    };
    Ok(())
}


#[derive(Debug, Clone)]
pub struct Generics {
    pub channel_id: ChannelId,
    pub data: UserData,
    pub guild_id: GuildId
}

impl Generics {
    pub async fn http(&self) -> Arc<Http> {
        self.data.inner.http.lock().await.clone().unwrap()
    }
    pub async fn from_user_data(data: &UserData, guild_id: &GuildId) -> Self {
        let server = data.inner.get_server(guild_id).await.expect("Server should exist");
        Self { 
            channel_id: server.channel_id.channel_id(),
            data: data.clone(),
            guild_id: guild_id.clone()
        }
    }
}

impl TypeMapKey for Generics {
    type Value = Generics;
}

pub fn get_generics(ctx: &SmContext<'_>) -> Generics {
    let data = ctx.data();
    Generics {
        channel_id: ctx.channel_id(),
        data: data.clone(),
        guild_id: ctx.guild_id().expect("GuildId should exist")
    }
}