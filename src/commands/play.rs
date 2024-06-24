use serenity::all::GuildId;
use songbird::input::{Compose, YoutubeDl};
use tracing::info;

use crate::{common::{SmData, Song}, executive::{get_generics, join, send_msg, Generics}, CommandResult, SmContext};


#[poise::command(prefix_command, guild_only, aliases("p"), check = "join")]
pub async fn play(ctx: SmContext<'_>, query: String) -> CommandResult {
    let generics = get_generics(ctx);

    start_song(SongType::New(query, ctx.author().id.to_string()), &generics, ctx.guild_id().expect("Should be a GuildId")).await;
    
    Ok(())
}

pub fn search_song(song: String, data: &SmData) -> YoutubeDl {
    let do_search = !song.starts_with("http");

    let src = if do_search {
        YoutubeDl::new_search(data.http.clone(), song)
    } else {
        YoutubeDl::new(data.http.clone(), song)
    };
    src
}

pub enum SongType {
    /// if the song is a new play request. the first parameter is the youtube query which can also be a url. second parameter is the requested by which is the author of the request  
    New(String, String),
    /// if the song is from the DB and being initialed from there
    DB(Song)
}

pub async fn start_song(song: SongType, generics: &Generics<'_>, guild_id: GuildId) {
    let Some(mut server) = generics.data.get_server(&guild_id) else {
        send_msg(generics, "Failed to aquire server", Some(15000)).await;
        return;
    };
    if let Some(handler_lock) = generics.data.songbird.get(guild_id) {
        let (query, requested_by) = match song {
            SongType::New(query, requested_by) => (query, requested_by),
            SongType::DB(song) => (song.url, song.requested_by),
        };
        let mut handler = handler_lock.lock().await;

        let mut src = search_song(query, generics.data);
        let song_data = match src.aux_metadata().await {
            Ok(song) => song,
            Err(err) => {
                info!("{}", err);
                return;
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
            requested_by
        };

        server.add_song(song);

        generics.data.update_server_db(server).await;

        send_msg(generics, format!("Playing song {}", title).as_str(), Some(15000)).await;
        info!("Playing song {}", title);
    } else {
        send_msg(generics, "Not in a voice channel to play in", Some(15000)).await;
    }
}