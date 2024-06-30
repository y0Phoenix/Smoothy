use songbird::{tracks::TrackHandle, typemap::TypeMap};

use crate::{common::song::Song, Generics, SongEndEvent, SongStartEvent, TrackMetaData};


pub async fn init_track(song: &Song, generics: &Generics, track: TrackHandle) -> TrackHandle {
    let clone = track.clone();
    let mut typemap = clone.typemap().write().await;
    let mut map = TypeMap::new();
    map.insert::<TrackMetaData>(TrackMetaData {
        song: song.clone(),
        generics: generics.clone(),
        client_tx: generics.data.inner.client_tx.clone()
    });
    *typemap = map;

    track.add_event(songbird::Event::Track(songbird::TrackEvent::Playable), SongStartEvent).unwrap();
    track.add_event(songbird::Event::Track(songbird::TrackEvent::End), SongEndEvent).unwrap();
    track
}