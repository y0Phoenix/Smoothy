use std::sync::Arc;

use serenity::all::CreateEmbed;
use songbird::{input::YoutubeDl, tracks::TrackHandle};
use tracing::info;

use crate::{common::{checks::vc, embeds::{err_embed, ADD_QUEUE_COLOR}, message::send_embed, server::ServerGuildId, song::Song, SmData}, executive::init_track, get_generics, CommandResult, Generics, SmContext};


#[poise::command(prefix_command, guild_only, aliases("p"), check = "vc")]
pub async fn play(ctx: SmContext<'_>, query: Vec<String>) -> CommandResult {
    let query = query.join(" ");
    info!("Command 'play' called with query: {}", query); // Logging
    let generics = get_generics(&ctx);

    let _ = start_song(SongType::New(query, ctx.author().id.to_string()), &generics).await;
    
    Ok(())
}


pub fn search_song(song: String, data: &Arc<SmData>) -> YoutubeDl {
    let do_search = !song.starts_with("http");

    let src = if do_search {
        YoutubeDl::new_search(data.reqwest.clone(), song)
    } else {
        YoutubeDl::new(data.reqwest.clone(), song)
    };
    src
}

#[derive(Debug, Clone)]
pub enum SongType {
    /// if the song is a new play request. the first parameter is the youtube query which can also be a url. second parameter is the requested by which is the author of the request  
    New(String, String),
    /// if the song is from the DB and being initialed from there
    DB(Song)
}

pub async fn start_song(song: SongType, generics: &Generics) -> Result<TrackHandle, ()> {
    let mut servers_lock = generics.data.inner.servers_unlocked().await;
    let Some(server) = servers_lock.0.get_mut(&ServerGuildId::from(generics.guild_id)) else {
        send_embed(generics, err_embed("Failed to aquire server"), Some(60000)).await;
        return Err(());
    };
    if let Some(handler_lock) = generics.data.inner.songbird.get(generics.guild_id) {
        let (query, _requested_by) = match song.clone() {
            SongType::New(query, requested_by) => (query, requested_by),
            SongType::DB(song) => (song.url, song.requested_by),
        };
        let mut handler = handler_lock.lock().await;

        let src = search_song(query, &generics.data.inner);
        
        
        let track = init_track(src, generics, song, &mut handler).await.expect("Should initialize track");

        if server.audio_player.state.is_playing() {
            let embed = CreateEmbed::new()
                .color(ADD_QUEUE_COLOR)
                .description(format!("***[{}]({})***\nHas been added to the queue :arrow_down:", track.1.title, track.1.url));
            send_embed(generics, embed, Some(300000)).await;
        }

        server.add_song(track.1);
        // info!("song len {}", server.songs.0.0.len());

        generics.data.inner.update_server_db(server).await;
        return Ok(track.0);
    } else {
        send_embed(generics, err_embed("Not in a voice channel to play in"), Some(30000)).await;
        return Err(());
    }
}