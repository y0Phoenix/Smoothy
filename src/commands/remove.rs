use std::usize;

use serenity::all::{Colour, CreateEmbed};

use crate::{
    common::{
        checks::is_playing, embeds::err_embed, generics::get_generics, message::send_embed,
        server::ServerGuildId, song::TrackMetaData,
    },
    CommandResult, SmContext,
};

#[poise::command(guild_only, prefix_command, aliases("r"), check = "is_playing")]
pub async fn remove(
    ctx: SmContext<'_>,
    #[description = "The index of the song you wish to remove"] index: String,
) -> CommandResult {
    let generics = get_generics(&ctx);

    let index = match index.parse::<usize>() {
        // we minus 1 because the user will input 2 if they want to remove the second track
        // but we need to follow 0th index structure so we need to subract 1
        Ok(index) => index - 1,
        Err(_) => {
            send_embed(
                &generics,
                err_embed("Not a valid index. Please enter a number"),
                Some(75000),
            )
            .await;
            return Ok(());
        }
    };

    let Some(manager) = generics.data.inner.songbird.get(generics.guild_id) else {
        send_embed(&generics, err_embed("Something went wrong. Failed to acquire voice manager. Try again later"), Some(75000)).await;
        return Ok(());
    };

    let mut servers_locked = generics.data.inner.servers_unlocked().await;
    let Some(server) = servers_locked.0.get_mut(&ServerGuildId::from(generics.guild_id)) else {
        send_embed(&generics, err_embed("Something went wrong. Failed to acquire server info. Try again later"), Some(75000)).await;
        return Ok(());
    };

    if server.songs.songs.get(index).is_none() {
        send_embed(
            &generics,
            err_embed(format!("No song at position {}", index + 1)),
            Some(60000),
        )
        .await;
        return Ok(());
    }

    let handler = manager.lock().await;
    let queue = handler.queue();
    let track = match queue.dequeue(index) {
        Some(track) => track,
        None => {
            send_embed(
                &generics,
                err_embed("Failed to remove track from queue"),
                Some(75000),
            )
            .await;
            return Ok(());
        }
    };

    let typemap = track.typemap().read().await;
    let Some(meta_data) = typemap.get::<TrackMetaData>() else {
        send_embed(&generics, err_embed("Something went wrong. Failed to acquire song info. Try again later"), Some(75000)).await;
        return Ok(());
    };

    send_embed(
        &generics,
        CreateEmbed::new()
            .color(Colour::BLURPLE)
            .description(format!(
                ":thumbsup: Removed ***[{}]({})***",
                meta_data.song.title, meta_data.song.url
            )),
        Some(60000),
    )
    .await;

    server.songs.songs.remove(index);

    Ok(())
}
