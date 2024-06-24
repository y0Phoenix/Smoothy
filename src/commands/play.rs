use std::{sync::Arc, time::Duration};

use songbird::{input::{Compose, YoutubeDl}, tracks::TrackHandle, typemap::TypeMap};
use tracing::info;

use crate::{common::{SmData, Song}, executive::{get_generics, join, send_msg, Generics}, CommandResult, SmContext, SongEndEvent, SongStartEvent};


#[poise::command(prefix_command, guild_only, aliases("p"), check = "join")]
pub async fn play(ctx: SmContext<'_>, query: String) -> CommandResult {
    let generics = get_generics(ctx);

    start_song(SongType::New(query, ctx.author().id.to_string()), &generics).await.unwrap();
    
    Ok(())
}

pub fn search_song(song: String, data: Arc<SmData>) -> YoutubeDl {
    let do_search = !song.starts_with("http");

    let src = if do_search {
        YoutubeDl::new_search(data.reqwest.clone(), song)
    } else {
        YoutubeDl::new(data.reqwest.clone(), song)
    };
    src
}

pub enum SongType {
    /// if the song is a new play request. the first parameter is the youtube query which can also be a url. second parameter is the requested by which is the author of the request  
    New(String, String),
    /// if the song is from the DB and being initialed from there
    DB(Song)
}

pub async fn start_song(song: SongType, generics: &Generics) -> Result<TrackHandle, ()> {
    let Some(mut server) = generics.data.get_server(&generics.guild_id) else {
        send_msg(generics, "Failed to aquire server", Some(15000)).await;
        return Err(());
    };
    if let Some(handler_lock) = generics.data.songbird.get(generics.guild_id) {
        let (query, requested_by) = match song {
            SongType::New(query, requested_by) => (query, requested_by),
            SongType::DB(song) => (song.url, song.requested_by),
        };
        let mut handler = handler_lock.lock().await;

        let mut src = search_song(query, generics.data.clone());
        let song_data = match src.aux_metadata().await {
            Ok(song) => song,
            Err(err) => {
                info!("{}", err);
                send_msg(generics, "There was a problem getting video information try again later", Some(60000)).await;
                return Err(());
            }
        };
        let title = song_data.title.unwrap_or_default();
        let url = song_data.source_url.unwrap_or_default();
        let thumbnail = song_data.thumbnail.unwrap_or_default();
        let duration = song_data.duration.unwrap_or_default();
        if server.audio_player.state.is_playing() {
            send_msg(generics, format!("Adding {} to queue", title).as_str(), Some(30000)).await;
        } else {
            info!("Playing song {}", title);
        }
        let track = handler.enqueue_with_preload(src.into(), Some(Duration::from_millis(250)));
        let clone = track.clone();
        
        let song = Song {
            title: title.clone(),
            url,
            thumbnail,
            duration_in_sec: duration.as_secs(),
            requested_by
        };
        
        let mut typemap = clone.typemap().write().await;
        let mut map = TypeMap::new();
        map.insert::<Song>(song.clone());
        *typemap = map;

        track.add_event(songbird::Event::Track(songbird::TrackEvent::Playable), SongStartEvent {
            generics: generics.clone().into()
        }).unwrap();
        track.add_event(songbird::Event::Track(songbird::TrackEvent::End), SongEndEvent {
            generics: generics.clone().into()
        }).unwrap();

        server.add_song(song);
        // info!("song len {}", server.songs.0.0.len());

        generics.data.update_server_db(server).await;

        // send_msg(generics, format!("Playing song {}", title).as_str(), Some(15000)).await;
        return Ok(track);
    } else {
        send_msg(generics, "Not in a voice channel to play in", Some(15000)).await;
        return Err(());
    }
}