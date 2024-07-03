use serenity::all::CreateEmbed;
use tracing::info;

use crate::{common::{checks::vc, embeds::{err_embed, ADD_QUEUE_COLOR}, generics::get_generics, message::send_embed, server::ServerGuildId, song::{search_song, SongType}}, executive::init_track, CommandResult, SmContext};


#[poise::command(prefix_command, guild_only, aliases("p"), check = "vc")]
pub async fn play(ctx: SmContext<'_>, query: Vec<String>) -> CommandResult {
    let query = query.join(" ");
    info!("Command 'play' called with query: {}", query); // Logging
    let generics = get_generics(&ctx);

    let mut servers_lock = generics.data.inner.servers_unlocked().await;
    let Some(server) = servers_lock.0.get_mut(&ServerGuildId::from(generics.guild_id)) else {
        send_embed(&generics, err_embed("Failed to aquire server"), Some(60000)).await;
        return Ok(());
    };

    let Some(handler_lock) = generics.data.inner.songbird.get(generics.guild_id) else {
        send_embed(&generics, err_embed(":cry: Something went wrong. Not in a voice channel to play in"), Some(75000)).await;
        return Ok(());
    };

    let mut handler = handler_lock.lock().await;

    let src = search_song(query.clone(), &generics.data.inner);
    
    let track = init_track(src, &generics, SongType::New(query, ctx.author().id.to_string()), &mut handler).await.expect("Should initialize track");

    if server.audio_player.state.is_playing() {
        let embed = CreateEmbed::new()
            .color(ADD_QUEUE_COLOR)
            .description(format!("***[{}]({})***\nHas been added to the queue :arrow_down:", track.1.title, track.1.url));
        send_embed(&generics, embed, Some(300000)).await;
    }

    server.add_song(track.1);
    // info!("song len {}", server.songs.0.0.len());

    generics.data.inner.update_server_db(server).await;
    Ok(())
}
