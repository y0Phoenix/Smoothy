use crate::{
    common::{
        checks::is_playing,
        embeds::{err_embed, GET_SERVER_FAIL_DLT_TIME, GET_SERVER_FAIL_MSG, LOOPED_COLOR},
        generics::get_generics,
        message::send_embed,
        server::ServerGuildId,
        song::TrackMetaData,
    },
    CommandResult, SmContext,
};
use serenity::all::CreateEmbed;

/// Loops the current song only
#[poise::command(prefix_command, guild_only, aliases("ls"), check = "is_playing")]
pub async fn loopsong(ctx: SmContext<'_>) -> CommandResult {
    let generics = get_generics(&ctx);
    let guild_id = ctx.guild_id().unwrap();

    let mut server_lock = generics.data.inner.servers_unlocked().await;
    let Some(server) = server_lock
        .0
        .get_mut(&ServerGuildId::from(generics.guild_id))
    else {
        send_embed(
            &generics,
            err_embed(GET_SERVER_FAIL_MSG),
            Some(GET_SERVER_FAIL_DLT_TIME),
        )
        .await;
        return Ok(());
    };

    let manager = &ctx.data().inner.songbird;
    let Some(manager) = manager.get(guild_id) else {
        send_embed(
            &generics,
            err_embed(":cry: Something went wrong. Not in a voice channel"),
            Some(75000),
        )
        .await;
        return Ok(());
    };
    let manager_lock = manager.lock().await;

    let Some(track) = manager_lock.queue().current() else {
        send_embed(
            &generics,
            err_embed(":cry: Something went wrong. No song currently playing"),
            Some(75000),
        )
        .await;
        return Ok(());
    };
    let meta_data = track.data::<TrackMetaData>();
    let song = meta_data.song.lock().await;
    let mut looped = meta_data.looped.lock().await;
    let description = if *looped {
        format!(
            ":x: No longer looping ***[{}]({})*** :repeat:",
            song.title, song.url
        )
    } else {
        format!(
            ":thumbsup: Looping ***[{}]({})*** :repeat:",
            song.title, song.url
        )
    };
    let embed = CreateEmbed::new()
        .color(LOOPED_COLOR)
        .description(description);
    server.songs.0.looped = false;
    if *looped {
        if track.disable_loop().is_err() {
            send_embed(
                &generics,
                err_embed(format!("Failed to disable loop on {}", song.title)),
                Some(60000),
            )
            .await;
            return Ok(());
        }
        *looped = false;
    } else {
        if track.enable_loop().is_err() {
            send_embed(
                &generics,
                err_embed(format!("Failed to enable loop on {}", song.title)),
                Some(60000),
            )
            .await;
            return Ok(());
        }
        *looped = true;
    }
    send_embed(&generics, embed, Some(60000)).await;

    generics.data.inner.update_server_db(server).await;

    Ok(())
}
