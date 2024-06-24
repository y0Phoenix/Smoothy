use songbird::input::{Compose, YoutubeDl};
use tracing::info;

use crate::{common::Song, executive::{join, send_msg}, CommandResult, SmContext};


#[poise::command(prefix_command, guild_only, aliases("p"), check = "join")]
pub async fn play(ctx: SmContext<'_>, url: String) -> CommandResult {
    let do_search = !url.starts_with("http");

    let guild_id = ctx.guild_id().unwrap();

    let data = ctx.data();

    let Some(mut server) = data.get_server(&guild_id) else {
        send_msg(ctx, "Failed to aquire server", Some(15000)).await;
        return Ok(());
    };
    if let Some(handler_lock) = data.songbird.get(guild_id) {
        let mut handler = handler_lock.lock().await;

        let mut src = if do_search {
            YoutubeDl::new_search(data.http.clone(), url)
        } else {
            YoutubeDl::new(data.http.clone(), url)
        };
        let song_data = match src.aux_metadata().await {
            Ok(song) => song,
            Err(err) => {
                info!("{}", err);
                return Ok(());
            }
        };
        let title = song_data.title.unwrap_or_default();
        let url = song_data.source_url.unwrap_or_default();
        let thumbnail = song_data.thumbnail.unwrap_or_default();
        let duration = song_data.duration.unwrap_or_default();
        let _song = handler.play_input(src.into());

        let song = Song {
            title: title.clone(),
            url,
            thumbnail,
            duration: duration.as_secs().to_string(),
            requested_by: ctx.author().id.to_string()
        };

        server.add_song(song);

        data.update_server_db(server).await;

        send_msg(ctx, format!("Playing song {}", title).as_str(), Some(15000)).await;
    } else {
        send_msg(ctx, "Not in a voice channel to play in", Some(15000)).await;
    }

    println!("Playing song");
    Ok(())
}