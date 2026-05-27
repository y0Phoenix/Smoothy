use std::sync::Arc;

use songbird::{
    input::{Compose, YoutubeDl},
    tracks::{Track, TrackHandle},
    Call,
};
use tracing::error;

use crate::{
    common::{
        embeds::err_embed,
        generics::Generics,
        message::send_embed,
        song::{search_song, Song, SongType, TrackMetaData},
    },
    events::{end::SongEndEvent, playable::SongStartEvent},
};

pub async fn init_track(
    src: Option<YoutubeDl<'static>>,
    generics: &Generics,
    song_type: SongType,
    handler: &mut tokio::sync::MutexGuard<'_, Call>,
) -> Result<(TrackHandle, Song), ()> {
    let (_query, requested_by) = match song_type {
        SongType::New(query, requested_by) => (query, requested_by),
        SongType::DB(song) => (song.url, song.requested_by),
    };
    let mut src = if let Some(src) = src {
        src
    } else {
        search_song(_query, &generics.data.inner).await.unwrap()
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

    let metadata = TrackMetaData {
        song: song.clone().into(),
        generics: generics.clone(),
        looped: false.into(),
    };

    let input: songbird::input::Input = src.into();
    let mut track_data = Track::from(input);
    track_data.user_data = Arc::new(metadata);

    let track = handler.enqueue(track_data).await;
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
