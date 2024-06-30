use sqlx::types::Json;
use tracing::info;

use crate::{add_global_events, get_generics, Generics, SmError};
use crate::SmContext;

use super::{message::send_msg, server::{Server, ServerChannelId, ServerGuildId}, song::Songs};

pub type CheckResult = Result<bool, SmError>;

pub async fn is_playing(ctx: SmContext<'_>) -> CheckResult {
    let generics = get_generics(&ctx);

    if let Some(server) = generics.data.inner.get_server(&ctx.guild_id().expect("Should be a GuildId")).await {
        match server.audio_player.state {
            crate::common::server::AudioPlayerState::Playing => return Ok(true),
            crate::common::server::AudioPlayerState::Idle => send_msg(&generics, "Not currently playing a song", Some(30000)).await,
            crate::common::server::AudioPlayerState::Paused => send_msg(&generics, "Player is currently paused", Some(30000)).await,
            crate::common::server::AudioPlayerState::Skipped => send_msg(&generics, "Player is skipping", Some(30000)).await,
        };
        return Ok(false);
    } else {
        send_msg(&generics, "Not Currently In A Voice Channel", Some(30000)).await;
    }
    Ok(false)
}

pub async fn vc(ctx: SmContext<'_>) -> CheckResult {
    let generics = Generics { 
        channel_id: ctx.channel_id(),
        data: ctx.data().clone(),
        guild_id: ctx.guild_id().expect("GuildId should exist")
    };
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
            send_msg(&generics, "You're not in a voice channel", Some(15000)).await;
            let err_msg = "Failed to join voice channel. User not in channel";
            info!("{err_msg}");
            return Ok(false);
        },
    };

    if let None = generics.data.inner.get_server(&guild_id).await {
        generics.data.inner.add_server_db(Server {
            id: ServerGuildId::from(&guild_id),
            channel_id: ServerChannelId::from(&ctx.channel_id()),
            voice_channel_id: ServerChannelId::from(&connect_to),
            name,
            songs: Json(Songs(Vec::new())),
            ..Default::default()
        }).await;
    }

    // data.print_servers();

    let manager = &ctx.data().inner.songbird;
    if let Ok(handler_lock) = manager.join(guild_id, connect_to).await {
        // Attach an event handler to see notifications of all track errors.
        let mut handler = handler_lock.lock().await;
        add_global_events(&mut handler, &generics);
    }
    Ok(true)
}