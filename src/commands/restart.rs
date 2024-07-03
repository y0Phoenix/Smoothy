use std::time::Duration;

use serenity::all::CreateEmbed;

use crate::{common::{checks::is_playing, embeds::{err_embed, SEEK_COLOR}, generics::get_generics, message::send_embed, song::TrackMetaData}, CommandResult, SmContext};

/// Restart the current song
#[poise::command(guild_only, prefix_command, check = "is_playing", aliases("again"))]
pub async fn restart(ctx: SmContext<'_>) -> CommandResult {
    let generics = get_generics(&ctx);

    let Some(manager) = generics.data.inner.songbird.get(generics.guild_id) else {
        send_embed(&generics, err_embed("Something went wrong. Failed to acquire voice manager. Try again later"), Some(75000)).await;
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
    
    let result = track.seek(Duration::from_secs(0));
    if result.is_hung_up() {
        send_embed(&generics, err_embed(format!("Failed to restart ***[{}]({})***", meta_data.song.title, meta_data.song.url)), Some(75000)).await;
        drop(result);
        return Ok(());
    }
    drop(result);

    send_embed(
        &generics,
        CreateEmbed::new()
            .description(format!(":arrows_clockwise: Restarting ***[{}]({})***", meta_data.song.title, meta_data.song.url))
            .color(SEEK_COLOR),
        Some(60000)
    ).await;

    Ok(())
}