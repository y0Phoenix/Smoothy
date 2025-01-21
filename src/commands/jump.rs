use std::usize;

use crate::{
    common::{
        checks::is_playing, embeds::err_embed, generics::get_generics, message::send_embed,
        server::ServerGuildId,
    },
    CommandResult, SmContext,
};

#[poise::command(guild_only, prefix_command, check = "is_playing", aliases("j"))]
pub async fn jump(
    ctx: SmContext<'_>,
    #[description = "The index of the song you wish to jump to in the queue"] index: String,
) -> CommandResult {
    let generics = get_generics(&ctx);
    let index = match index.parse::<usize>() {
        Ok(index) => index,
        Err(_) => {
            send_embed(
                &generics,
                err_embed("Index provided isn't a valid number"),
                Some(60000),
            )
            .await;
            return Ok(());
        }
    };

    let mut servers_locked = generics.data.inner.servers_unlocked().await;
    let Some(server) = servers_locked.0.get_mut(&ServerGuildId::from(generics.guild_id)) else {
        send_embed(&generics, err_embed("Something went wrong. Failed to acquire server info. Try again later"), Some(75000)).await;
        return Ok(());
    };

    if server.songs.songs.get(index).is_none() {
        send_embed(
            &generics,
            err_embed(format!("No song at position {}", index)),
            Some(60000),
        )
        .await;
        return Ok(());
    };

    let Some(manager) = generics.data.inner.songbird.get(generics.guild_id) else {
        send_embed(&generics, err_embed("Something went wrong. Failed to acquire voice manager. Try again later"), Some(75000)).await;
        return Ok(());
    };

    let handler = manager.lock().await;
    handler.queue().modify_queue(|queue| {
        let Some(track) = queue.remove(index) else {
            let _ = send_embed(&generics, err_embed(format!("Failed to aquire song at position {}", index)), Some(60000));
            return;
        };
        queue.push_front(track);

        let song = server.songs.songs.remove(index);
        server.songs.songs.push(song);
        handler.queue().skip().expect("Should be able to skip song");
    });

    Ok(())
}
