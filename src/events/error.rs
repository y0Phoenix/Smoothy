use songbird::events::{Event, EventContext, EventHandler as VoiceEventHandler};
use tracing::{error, warn};

use crate::common::{embeds::err_embed, message::send_embed, song::TrackMetaData};

pub struct TrackErrorNotifier;

// songbird track error event
#[serenity::async_trait]
impl VoiceEventHandler for TrackErrorNotifier {
    async fn act(&self, ctx: &EventContext<'_>) -> Option<Event> { 
        warn!("songbird error event fired");
        if let EventContext::Track(track_list) = ctx {
            for (state, handle) in *track_list {
                let typemap = handle.typemap().read().await;
                let meta_data = typemap.get::<TrackMetaData>().expect("Should have meta data");
                let error = match &state.playing {
                    songbird::tracks::PlayMode::Errored(err) => {
                        match err {
                            songbird::error::PlayError::Create(err) => format!("Create stream error occured on ***[{}]({})*** {}", meta_data.song.title, meta_data.song.url, err),
                            songbird::error::PlayError::Parse(err) => format!("Parsing error occured on ***[{}]({})*** {}", meta_data.song.title, meta_data.song.url, err),
                            songbird::error::PlayError::Decode(err) => format!("Decode error occured on ***[{}]({})*** {}", meta_data.song.title, meta_data.song.url, err),
                            songbird::error::PlayError::Seek(err) => format!("Seek error occured on ***[{}]({})*** {}", meta_data.song.title, meta_data.song.url, err),
                            _ => format!("Error occured on ***[{}]({})*** try again later", meta_data.song.title, meta_data.song.url),
                        }
                    },
                    _ => format!("Error occured on ***[{}]({})*** try again later", meta_data.song.title, meta_data.song.url),
                };
                error!("{error}");
                send_embed(&meta_data.generics, err_embed(error), Some(75000)).await;
            }
        }
        None
    }
}