use std::{str::FromStr, sync::Arc};

use commands::play::search_song;
use common::{embeds::{err_embed, LEAVING_COLOR, NOW_PLAYING_COLOR}, message::{send_embed, NowPlayingMsg}, server::{ServerChannelId, ServerGuildId, ServersLock}, song::Song, UserData};
use executive::init_track;
use ::serenity::{all::{ChannelId, CreateEmbed, CreateEmbedAuthor, GuildId, Http, MessageId}, async_trait};
use serenity::all as serenity;
// Event related imports to detect track creation failures.
use songbird::{events::{Event, EventContext, EventHandler as VoiceEventHandler}, typemap::TypeMapKey, Call, TrackEvent};
use tracing::{error, info, warn};

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
    pub content: CreateEmbed
}

#[derive(Debug, Clone)]
pub struct TrackMetaData {
    pub song: Song,
    pub generics: Generics,
}

impl TypeMapKey for TrackMetaData {
    type Value = TrackMetaData;
}

pub struct TrackErrorNotifier;

//
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
pub struct SongEndEvent;

// the event that fires when the song ends
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

            let mut servers = meta_data.generics.data.inner.servers.lock().await;
            let server = servers.0.get_mut(&ServerGuildId::from(&meta_data.generics.guild_id)).expect("Server should exist");
            // info!("song len {}", server.songs.0.0.len());
            server.songs.next_song();
            // info!("song len {}", server.songs.0.0.len());
            // stop the audio player to maintain state update
            server.audio_player.stop();
            let no_more_songs = server.songs.0.is_empty();
            if no_more_songs {
                let embed = CreateEmbed::new()
                    .color(LEAVING_COLOR)
                    .description(":x: No more songs to play");
                send_embed(&meta_data.generics, embed, Some(10000)).await;
                info!("No more songs to play in {} starting dc timeout", server.name);
                meta_data.generics.data.inner.start_dc_timer(ServerGuildId::from(meta_data.generics.guild_id), ServerChannelId::from(meta_data.generics.channel_id));
            }
            meta_data.generics.data.inner.update_server_db(server).await;
        }
        None
    }
}

pub struct SongStartEvent;

// the event that fires when the song starts or is within 5 seconds of starting if next in queue
#[async_trait]
impl VoiceEventHandler for SongStartEvent {
    async fn act(&self, ctx: &EventContext<'_>) -> Option<Event> {
        // println!("playable event");
        if let EventContext::Track(tracks) = ctx {
            let track = tracks.get(0).expect("Should be a track at 0");

            let mut typemap = track.1.typemap().write().await;
            let meta_data = typemap.get_mut::<TrackMetaData>().expect("Should have metadata");
            let mut servers = meta_data.generics.data.inner.servers.lock().await;
            let server = servers.0.get_mut(&ServerGuildId::from(&meta_data.generics.guild_id)).expect("Server should exist");
            server.dc_timer_started = false;
            server.audio_player.play();
            // let curr_song = server.songs.curr_song().unwrap();
            let embed = CreateEmbed::new()
                .color(NOW_PLAYING_COLOR)
                .author(CreateEmbedAuthor::new("Now Playing").icon_url("https://cdn.discordapp.com/attachments/778600026280558617/781024479623118878/ezgif.com-gif-maker_1.gif"))
                .description(format!("***[{}]({})***", meta_data.song.title, meta_data.song.url))
                .field("Requested by", format!("<@{}>", meta_data.song.requested_by), true)
                .field("Duration", format!("{}", meta_data.song.duration_formatted()), true)
                .thumbnail(meta_data.song.thumbnail.clone())
            ;
            if let Some(msg) = send_embed(&meta_data.generics, embed, None).await {
                meta_data.song.now_playing_msg = Some(NowPlayingMsg {
                    channel_id: msg.channel_id.to_string(),
                    msg_id: msg.id.to_string()
                });
            }
            meta_data.generics.data.inner.update_server_db(&server).await;
            meta_data.generics.data.inner.stop_dc_timer(ServerGuildId::from(meta_data.generics.guild_id), ServerChannelId::from(meta_data.generics.channel_id));
        }
        None
    }
}

pub struct SongPlayEvent;

#[async_trait]
impl VoiceEventHandler for SongPlayEvent {
    async fn act(&self, ctx: &EventContext<'_>) -> Option<Event> {
        // println!("playable event");
        if let EventContext::Track(tracks) = ctx {
            let track = tracks.get(0).expect("Should be a track at 0");

            let mut typemap = track.1.typemap().write().await;
            let meta_data = typemap.get_mut::<TrackMetaData>().expect("Should have metadata");
            let mut servers = meta_data.generics.data.inner.servers.lock().await;
            let server = servers.0.get_mut(&ServerGuildId::from(&meta_data.generics.guild_id)).expect("Server should exist");
            // set the audio player status back to play from idle.
            // when a song is started from the queue the "Playable" event is never fired 
            // so the audio player status will remain idle from the "End" event being fired
            // additionally we only set it to play when idle because thats the only state the player is in with this scenario
            if server.audio_player.state.is_idle() {
                server.audio_player.play();
                meta_data.generics.data.inner.update_server_db(server).await;
            }
            
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
    info!("Global Events Added");
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
            let mut servers_lock = data.inner.servers_unlocked().await;
            let servers = data.inner.get_servers_db(&mut servers_lock).await;
            for (_, server) in servers.0.iter() {
                info!("{}", server.id.0);
                let guild_id = server.id.guild_id();

                let manager = &data.inner.songbird;
                let in_vc = manager.get(guild_id).is_some();

                if server.songs.0.is_empty() {
                    info!("removing db");
                    data.inner.remove_server_db(&guild_id, &mut servers_lock).await;
                    if in_vc {
                        data.inner.start_dc_timer(ServerGuildId::from(guild_id), server.channel_id.clone());
                    }
                    continue;
                }
                let generics = Generics::from_user_data(data, &guild_id, &mut servers_lock);
                let voice_channel_id = server.voice_channel_id.clone().channel_id();

                if let Ok(handler_lock) = manager.join(generics.guild_id, voice_channel_id).await {
                    // Attach an event handler to see notifications of all track errors.
                    let mut handler = handler_lock.lock().await;
                    add_global_events(&mut handler, &generics);
                    for song in server.songs.0.0.iter() {
                        info!("{}", song.title);
                        let src = search_song(song.url.clone(), &generics.data.inner);
                        let track = handler.enqueue(src.into()).await;

                        init_track(&song, &generics, track).await;
                    }
                }
                else {
                    send_embed(&generics, err_embed("Failed to join vc"), Some(60000)).await;
                    error!("Failed to join vc from bot ready state in {}", server.name);
                    data.inner.remove_server_db(&guild_id, &mut servers_lock).await;
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
                    let mut servers_lock = data.inner.servers_unlocked().await;
                    data.inner.remove_server_db(&guild_id, &mut servers_lock).await;
                }
            }
        },
        // serenity::FullEvent::Message { new_message } => {
        //     // FrameworkContext contains all data that poise::Framework usually manages
        //     // let shard_manager = (*_framework.shard_manager).clone();
        //     // let framework_data = poise::FrameworkContext {
        //     //     bot_id: *data.inner.id.lock().unwrap(),
        //     //     options: &_framework.options,
        //     //     user_data: data,
        //     //     shard_manager: &shard_manager,
        //     // };

        //     // let event = serenity::FullEvent::Message { new_message: new_message.clone() };
        //     // poise::dispatch_event(framework_data, &ctx, event).await;
        //     info!("msg {}", new_message.content);
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
    pub fn from_user_data(data: &UserData, guild_id: &GuildId, servers_lock: &mut ServersLock<'_>) -> Self {
        let server = servers_lock.0.get_mut(&ServerGuildId::from(guild_id)).expect("Server should exist");
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