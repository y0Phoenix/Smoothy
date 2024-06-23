use songbird::input::YoutubeDl;

use crate::{executive::{send_msg, join}, CommandResult, SmContext};

#[poise::command(prefix_command, guild_only, aliases("p"))]
pub async fn play(ctx: SmContext<'_>, url: String) -> CommandResult {
    if let Err(_err) = join(ctx).await {
        return Ok(());
    }
    let do_search = !url.starts_with("http");

    let guild_id = ctx.guild_id().unwrap();

    let data = ctx.data();
    if let Some(handler_lock) = data.songbird.get(guild_id) {
        let mut handler = handler_lock.lock().await;

        let src = if do_search {
            YoutubeDl::new_search(data.http.clone(), url)
        } else {
            YoutubeDl::new(data.http.clone(), url)
        };
        let _ = handler.play_input(src.into());

        send_msg(ctx, "Playing song", 15000).await;
    } else {
        send_msg(ctx, "Not in a voice channel to play in", 15000).await;
    }

    Ok(())
}