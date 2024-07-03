use serenity::all::CreateEmbed;

use crate::{common::{embeds::{err_embed, PAUSE_COLOR}, generics::get_generics, message::send_embed, server::ServerGuildId, song::TrackMetaData}, CommandResult, SmContext};

/// Resume song
#[poise::command(guild_only, prefix_command, aliases("re", "unpause"))]
pub async fn resume(ctx: SmContext<'_>) -> CommandResult {
    let generics = get_generics(&ctx);

    let Some(manager) = generics.data.inner.songbird.get(generics.guild_id) else {
        send_embed(&generics, err_embed("Something went wrong. Failed to acquire voice manager. Try again later"), Some(75000)).await;
        return Ok(());
    };

    let servers_locked = generics.data.inner.servers_unlocked().await;
    let Some(server) = servers_locked.0.get(&ServerGuildId::from(generics.guild_id)) else {
        send_embed(&generics, err_embed("Something went wrong. Failed to acquire server info. Try again later"), Some(75000)).await;
        return Ok(());
    };

    if !server.audio_player.state.is_paused() {
        send_embed(&generics, err_embed("Not currently paused"), Some(30000)).await;
        return Ok(());
    }

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

    if track.play().is_err() {
        send_embed(&generics, err_embed(format!("Failed to resume ***[{}]({})***", meta_data.song.title, meta_data.song.url)), Some(75000)).await;
        return Ok(());
    }

    send_embed(
        &generics,
        CreateEmbed::new()
            .color(PAUSE_COLOR)
            .description(format!(":arrow_forward: Resumed ***[{}]({})***", meta_data.song.title, meta_data.song.url)),
        Some(60000)
    ).await;

    Ok(())
}