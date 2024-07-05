use sqlx::types::Json;
use tracing::info;

use crate::{common::generics::Generics, events::add_global_events, SmContext, SmError};

use super::{
    embeds::{err_embed, GET_SERVER_FAIL_DLT_TIME, GET_SERVER_FAIL_MSG},
    generics::get_generics,
    message::send_embed,
    server::{Server, ServerChannelId, ServerGuildId},
    song::Songs,
};

pub type CheckResult = Result<bool, SmError>;

pub async fn is_playing(ctx: SmContext<'_>) -> CheckResult {
    let generics = get_generics(&ctx);

    let songbird = &generics.data.inner.songbird;

    if let Some(manager) = songbird.get(generics.guild_id) {
        let manager_lock = manager.lock().await;

        if manager_lock.queue().current().is_none() {
            send_embed(
                &generics,
                err_embed(":rofl: Not currently playing a song"),
                Some(45000),
            )
            .await;
            return Ok(false);
        }

        let servers = generics.data.inner.servers.lock().await;
        if let Some(server) = servers.0.get(&ServerGuildId::from(generics.guild_id)) {
            info!("Checking play state for {}", server.name);
            match server.audio_player.state {
                crate::common::server::AudioPlayerState::Playing => return Ok(true),
                crate::common::server::AudioPlayerState::Idle => {
                    send_embed(
                        &generics,
                        err_embed("Not currently playing a song"),
                        Some(30000),
                    )
                    .await
                }
                crate::common::server::AudioPlayerState::Paused => {
                    send_embed(
                        &generics,
                        err_embed("Player is currently paused"),
                        Some(30000),
                    )
                    .await
                }
                crate::common::server::AudioPlayerState::Skipped => {
                    send_embed(&generics, err_embed("Player is skipping"), Some(30000)).await
                }
            };
            return Ok(false);
        } else {
            send_embed(
                &generics,
                err_embed(GET_SERVER_FAIL_MSG),
                Some(GET_SERVER_FAIL_DLT_TIME),
            )
            .await;
            if let Err(err) = songbird.remove(generics.guild_id).await {
                send_embed(
                    &generics,
                    err_embed(format!(":x: Failed to leave voice channel {}", err)),
                    Some(60000),
                )
                .await;
            }
        }
    } else {
        send_embed(
            &generics,
            err_embed(":rofl: Not Currently In A Voice Channel"),
            Some(30000),
        )
        .await;
    }

    Ok(false)
}

pub async fn vc(ctx: SmContext<'_>) -> CheckResult {
    let generics = Generics {
        channel_id: ctx.channel_id(),
        data: ctx.data().clone(),
        guild_id: ctx.guild_id().expect("GuildId should exist"),
    };

    if generics
        .data
        .inner
        .songbird
        .get(generics.guild_id)
        .is_some()
    {
        info!("Already in voice channel");
        return Ok(true);
    }

    let (guild_id, channel, name) = {
        let guild = ctx.guild().unwrap();
        let name = guild.name.clone();
        let channel_id = guild
            .voice_states
            .get(&ctx.author().id)
            .and_then(|voice_state| voice_state.channel_id);

        (guild.id, channel_id, name)
    };

    let connect_to = match channel {
        Some(channel) => channel,
        None => {
            send_embed(
                &generics,
                err_embed("You're not in a voice channel"),
                Some(30000),
            )
            .await;
            let err_msg = "Failed to join voice channel. User not in channel";
            info!("{err_msg}");
            return Ok(false);
        }
    };

    let mut servers = generics.data.inner.servers_unlocked().await;
    if !servers.0.contains_key(&ServerGuildId::from(guild_id)) {
        let server = Server {
            id: ServerGuildId::from(guild_id),
            channel_id: ServerChannelId::from(ctx.channel_id()),
            voice_channel_id: ServerChannelId::from(connect_to),
            name,
            songs: Json(Songs::default()),
            ..Default::default()
        };
        servers.0.insert(server.id.clone(), server.clone());
        generics.data.inner.add_server_db(server).await;
    }
    info!("Server added");

    // data.print_servers();

    let manager = &ctx.data().inner.songbird;
    if let Ok(handler_lock) = manager.join(guild_id, connect_to).await {
        // Attach an event handler to see notifications of all track errors.
        let mut handler = handler_lock.lock().await;
        add_global_events(&mut handler, &generics);
    } else {
        send_embed(&generics, err_embed("Failed to join vc"), Some(60000)).await;
    }
    Ok(true)
}

