use songbird::{
    input::{Compose, YoutubeDl},
    tracks::TrackHandle,
    typemap::TypeMap,
    Call,
};
use tracing::error;

use crate::{
    common::{
        embeds::err_embed,
        generics::Generics,
        message::send_embed,
        song::{Song, SongType, TrackMetaData},
    },
    events::{end::SongEndEvent, playable::SongStartEvent},
};

pub async fn init_track(
    mut src: YoutubeDl,
    generics: &Generics,
    song_type: SongType,
    handler: &mut tokio::sync::MutexGuard<'_, Call>,
) -> Result<(TrackHandle, Song), ()> {
    let (_query, requested_by) = match song_type {
        SongType::New(query, requested_by) => (query, requested_by),
        SongType::DB(song) => (song.url, song.requested_by),
    };

    let song_data = match src.aux_metadata().await {
        Ok(song) => song,
        Err(err) => {
            error!("{}", err);
            send_embed(
                generics,
                err_embed("There was a problem getting video information try again later"),
                Some(60000),
            )
            .await;
            return Err(());
        }
    };

    let title = song_data.title.unwrap_or_default();
    let url = song_data.source_url.unwrap_or_default();
    let thumbnail = song_data.thumbnail.unwrap_or_default();
    let duration = song_data.duration.unwrap_or_default();

    let song = Song {
        title: title.clone(),
        url,
        thumbnail,
        duration_in_sec: duration.as_secs(),
        requested_by,
        ..Default::default()
    };

    let track = handler.enqueue_input(src.clone().into()).await;
    let clone = track.clone();
    let mut typemap = clone.typemap().write().await;
    let mut map = TypeMap::new();

    map.insert::<TrackMetaData>(TrackMetaData {
        song: song.clone(),
        generics: generics.clone(),
        looped: false,
        src,
    });
    *typemap = map;

    track
        .add_event(
            songbird::Event::Track(songbird::TrackEvent::Playable),
            SongStartEvent,
        )
        .unwrap();
    track
        .add_event(
            songbird::Event::Track(songbird::TrackEvent::End),
            SongEndEvent,
        )
        .unwrap();
    // track.add_event(songbird::Event::Track(songbird::TrackEvent::Play), SongPlayEvent).unwrap();
    // track.add_event(songbird::Event::Track(songbird::TrackEvent::Loop), SongLoopEvent).unwrap();
    Ok((track, song))
}

