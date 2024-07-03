use std::time::Duration;

use serenity::all::CreateEmbed;

use crate::{common::{checks::is_playing, embeds::{err_embed, SEEK_COLOR}, generics::get_generics, message::send_embed, song::TrackMetaData}, CommandResult, SmContext};

/// Seek song to a position
#[poise::command(guild_only, prefix_command, check = "is_playing")]
pub async fn seek(ctx: SmContext<'_>, #[description = "Valid format 'H:M:S'"] seek: String) -> CommandResult {
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

    let seek_cleaned = seek.replace(&['.', ',', ';'][..], ":");
    let parts: Vec<&str> = seek_cleaned.split(':').collect();
    let duration_in_secs: u64;

    match parts.len() {
        1 => {
            let Ok(secs) = parts[0].parse::<u64>() else { 
                send_embed(&generics, err_embed("Invalid seek format. Please use H:M:S format."), Some(75000)).await;
                return Ok(());
            };
            duration_in_secs = secs
        },
        2 => {
            let Ok(mins) = parts[0].parse::<u64>() else {
                send_embed(&generics, err_embed("Invalid seek format. Please use H:M:S format."), Some(75000)).await;
                return Ok(());
            };
            let Ok(secs) = parts[1].parse::<u64>() else {
                send_embed(&generics, err_embed("Invalid seek format. Please use H:M:S format."), Some(75000)).await;
                return Ok(());
            };
            duration_in_secs = mins * 60 + secs;
        },
        3 => {
            let Ok(hours) = parts[0].parse::<u64>() else {
                send_embed(&generics, err_embed("Invalid seek format. Please use H:M:S format."), Some(75000)).await;
                return Ok(());
            };
            let Ok(mins) = parts[1].parse::<u64>() else {
                send_embed(&generics, err_embed("Invalid seek format. Please use H:M:S format."), Some(75000)).await;
                return Ok(());
            };
            let Ok(secs) = parts[2].parse::<u64>() else {
                send_embed(&generics, err_embed("Invalid seek format. Please use H:M:S format."), Some(75000)).await;
                return Ok(());
            };
            duration_in_secs = hours * 3600 + mins * 60 + secs;

            if meta_data.song.duration_in_sec < 3600 && duration_in_secs >= 3600 {
                send_embed(&generics, err_embed("Invalid seek format. Hour specified but video is less than an hour."), Some(75000)).await;
                return Ok(());
            }
        },
        _ => {
            send_embed(&generics, err_embed("Invalid seek format. Please use H:M:S format."), Some(75000)).await;
            return Ok(());
        }
    }

    // Use duration_in_secs for seeking
    let result = track.seek(Duration::from_secs(duration_in_secs));
    if result.is_hung_up() {
        send_embed(&generics, err_embed(format!("Failed to restart ***[{}]({})***", meta_data.song.title, meta_data.song.url)), Some(75000)).await;
        drop(result);
        return Ok(());
    }
    drop(result);

    send_embed(
        &generics,
        CreateEmbed::new()
            .description(format!(":thumbsup: Seeking to ***{}*** ***[{}]({})***", seek, meta_data.song.title, meta_data.song.url))
            .color(SEEK_COLOR),
        Some(60000)
    ).await;

    Ok(())
}