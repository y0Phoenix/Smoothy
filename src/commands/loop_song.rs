use serenity::all::CreateEmbed;
use crate::{common::{checks::is_playing, embeds::{err_embed, LOOPED_COLOR}, message::send_embed}, get_generics, CommandResult, SmContext, TrackMetaData};

#[poise::command(prefix_command, guild_only, aliases("loop", "l"), check = "is_playing")]
pub async fn loop_song(ctx: SmContext<'_>) -> CommandResult {
    let generics = get_generics(&ctx);
    let guild_id = ctx.guild_id().unwrap();
    
    let manager = &ctx.data().inner.songbird;
    if let Some(manager) = manager.get(guild_id) {
        let manager_lock = manager.lock().await;

        if let Some(track) = manager_lock.queue().current() {
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
        }
        else {
            send_embed(&generics, err_embed("Not currently playing a song"), Some(60000)).await;
        }
    }
    else {
        send_embed(&generics, err_embed("Not currently in a voice channel"), Some(60000)).await;
    }

    Ok(())
}