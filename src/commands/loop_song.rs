use serenity::all::CreateEmbed;
use crate::{common::{checks::is_playing, embeds::{err_embed, GET_SERVER_FAIL_DLT_TIME, GET_SERVER_FAIL_MSG, LOOPED_COLOR}, message::send_embed, server::ServerGuildId}, get_generics, CommandResult, SmContext, TrackMetaData};

#[poise::command(prefix_command, guild_only, aliases("ls"), check = "is_playing")]
pub async fn loopsong(ctx: SmContext<'_>) -> CommandResult {
    let generics = get_generics(&ctx);
    let guild_id = ctx.guild_id().unwrap();

    let mut server_lock = generics.data.inner.servers_unlocked().await;
    let Some(server) = server_lock.0.get_mut(&ServerGuildId::from(generics.guild_id)) else {
        send_embed(&generics, err_embed(GET_SERVER_FAIL_MSG), Some(GET_SERVER_FAIL_DLT_TIME)).await;
        return Ok(());
    };
    
    let manager = &ctx.data().inner.songbird;
    let Some(manager) = manager.get(guild_id) else { 
        send_embed(&generics, err_embed(":cry: Something went wrong. Not in a voice channel"), Some(75000)).await;
        return Ok(()); 
    };
    let manager_lock = manager.lock().await;

    let Some(track) = manager_lock.queue().current() else {
        send_embed(&generics, err_embed(":cry: Something went wrong. No song currently playing"), Some(75000)).await;
        return Ok(());
    };
    let mut typemap = track.typemap().write().await;
    let meta_data = typemap.get_mut::<TrackMetaData>().expect("Track meta data should be initialized");
    let description = if meta_data.looped {
        format!(":x: No longer looping ***[{}]({})*** :repeat:", meta_data.song.title, meta_data.song.url)
    }
    else {
        format!(":thumbsup: Looping ***[{}]({})*** :repeat:", meta_data.song.title, meta_data.song.url)
    };
    let embed = CreateEmbed::new()
        .color(LOOPED_COLOR)
        .description(description);
    server.songs.0.looped = false;
    if meta_data.looped {
        if let Err(_) = track.disable_loop() {
            send_embed(&generics, err_embed(format!("Failed to disable loop on {}", meta_data.song.title)), Some(60000)).await;
            return Ok(());
        }
        meta_data.looped = false;
    }
    else {
        if let Err(_) = track.enable_loop() {
            send_embed(&generics, err_embed(format!("Failed to enable loop on {}", meta_data.song.title)), Some(60000)).await;
            return Ok(());
        }
        meta_data.looped = true;
    }
    send_embed(&generics, embed, Some(60000)).await;

    Ok(())
}