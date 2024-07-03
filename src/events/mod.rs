// use end::SongEndEvent;
use error::TrackErrorNotifier;
use play::SongPlayEvent;
// use playable::SongStartEvent;
use tracing::error;
use songbird::{Call, Event, TrackEvent};
use tracing::info;
use serenity::all as serenity;

use crate::{common::{embeds::err_embed, generics::Generics, message::send_embed, server::ServerGuildId, song::{search_song, SongType}, UserData}, executive::init_track, SmError};

pub mod playable;
pub mod play;
pub mod end;
pub mod error;

pub fn add_global_events(handler: &mut tokio::sync::MutexGuard<Call>, _generics: &Generics) {
    handler.add_global_event(TrackEvent::Error.into(), TrackErrorNotifier);
    // handler.add_global_event(Event::Track(TrackEvent::End), SongEndEvent);
    // handler.add_global_event(Event::Track(TrackEvent::Playable), SongStartEvent);
    handler.add_global_event(Event::Track(TrackEvent::Play), SongPlayEvent);
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
                    for song in server.songs.0.songs.iter() {
                        let src = search_song(song.url.clone(), &generics.data.inner);
                        init_track(src, &generics, SongType::DB(song.clone()), &mut handler).await.expect("Should initialize track");
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
                if new.member.clone().unwrap().user.id == *data.inner.id.lock().await {
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