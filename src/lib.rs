use std::str::FromStr;

use commands::play::start_song;
// use commands::play::play;
use common::SmData;
use executive::Generics;
use ::serenity::all::{CacheHttp, ChannelId, GuildId};
use serenity::all as serenity;
// Event related imports to detect track creation failures.
use songbird::{events::{Event, EventContext, EventHandler as VoiceEventHandler}, TrackEvent};

pub mod commands;
pub mod executive;
pub mod common;

pub type SmError = Box<dyn std::error::Error + Send + Sync>;
// TODO add delete msg automatically functionality. create a wrapper struct over this to handle this easily
pub type SmContext<'a> = poise::Context<'a, SmData, SmError>;
pub type CommandResult = Result<(), SmError>;

pub struct TrackErrorNotifier;

#[serenity::async_trait]
impl VoiceEventHandler for TrackErrorNotifier {
    async fn act(&self, ctx: &EventContext<'_>) -> Option<Event> {
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

/// global event handler for discord
pub async fn event_handler(
    ctx: &serenity::Context,
    event: &serenity::FullEvent,
    _framework: poise::FrameworkContext<'_, SmData, SmError>,
    data: &SmData,
) -> Result<(), SmError> {
    match event {
        serenity::FullEvent::Ready { data_about_bot, .. } => {
            data.init_bot(data_about_bot.user.id);
            let servers = data.get_servers_db().await;
            let mut generics = Generics {
                channel_id: ChannelId::default(),
                http: ctx.http.http(),
                data,
            };
            for (_, server) in servers.0.iter() {
                generics.channel_id = ChannelId::from_str(&server.channel_id).unwrap();
                let guild_id = GuildId::from_str(&server.id).expect("Should be valid GuildId");
                let voice_channel_id = ChannelId::from_str(&server.voice_channel_id).expect("Should be valid VoiceChannelId");
                println!("server {}", server.name);
                if let Some(song) = server.songs.curr_song() {
                    let manager = &data.songbird;
                    if let Ok(handler_lock) = manager.join(guild_id, voice_channel_id).await {
                        // Attach an event handler to see notifications of all track errors.
                        let mut handler = handler_lock.lock().await;
                        handler.add_global_event(TrackEvent::Error.into(), TrackErrorNotifier);
                    }
                    start_song(commands::play::SongType::DB(song), &generics, guild_id).await
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
    }
    Ok(())
}