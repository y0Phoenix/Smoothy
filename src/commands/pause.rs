use serenity::all::CreateEmbed;

use crate::{common::{checks::is_playing, embeds::{err_embed, PAUSE_COLOR}, generics::get_generics, message::send_embed, server::ServerGuildId, song::TrackMetaData}, CommandResult, SmContext};

/// Pause song
#[poise::command(guild_only, prefix_command, check = "is_playing", aliases("pa"))]
pub async fn pause(ctx: SmContext<'_>) -> CommandResult {
    let generics = get_generics(&ctx);

    let Some(manager) = generics.data.inner.songbird.get(generics.guild_id) else {
        send_embed(&generics, err_embed("Something went wrong. Failed to acquire voice manager. Try again later"), Some(75000)).await;
        return Ok(());
    };

    let mut servers_locked = generics.data.inner.servers_unlocked().await;
    let Some(server) = servers_locked.0.get_mut(&ServerGuildId::from(generics.guild_id)) else {
        send_embed(&generics, err_embed("Something went wrong. Failed to acquire server info. Try again later"), Some(75000)).await;
        return Ok(());
    };

    let handler = manager.lock().await;
    let Some(track) = handler.queue().current() else {
        send_embed(&generics, err_embed("Something went wrong. Failed to aquire current song. Try again later"), Some(75000)).await;
        return Ok(());
    };

    let typemap = track.typemap().read().await;
    let Some(meta_data) = typemap.get::<TrackMetaData>() else {
        send_embed(&generics, err_embed("Something went wrong. Failed to aquire song info. Try again later"), Some(75000)).await;
        return Ok(());
    };

    if track.pause().is_err() {
        send_embed(&generics, err_embed(format!("Failed to pause ***[{}]({})***", meta_data.song.title, meta_data.song.url)), Some(75000)).await;
        return Ok(());
    }

    // pause the audioplayer to maintain state
    server.audio_player.pause();
    send_embed(
        &generics,
        CreateEmbed::new()
            .color(PAUSE_COLOR)
            .description(format!(":pause_button: Paused ***[{}]({})***", meta_data.song.title, meta_data.song.url)),
        Some(60000)
    ).await;

    Ok(())
}