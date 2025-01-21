use serenity::async_trait;
use songbird::events::{Event, EventContext, EventHandler as VoiceEventHandler};

use crate::common::{
    embeds::now_playing_embed,
    message::{delete_now_playing_msg, send_embed, NowPlayingMsg},
    server::ServerGuildId,
    song::TrackMetaData,
};

pub struct SongPlayEvent;

#[async_trait]
impl VoiceEventHandler for SongPlayEvent {
    async fn act(&self, ctx: &EventContext<'_>) -> Option<Event> {
        // println!("playable event");
        if let EventContext::Track(tracks) = ctx {
            let track = tracks.first().expect("Should be a track at 0");

            // aquire the meta data on the track for info
            let mut typemap = track.1.typemap().write().await;
            let meta_data = typemap
                .get_mut::<TrackMetaData>()
                .expect("Should have metadata");

            let mut servers = meta_data.generics.data.inner.servers.lock().await;
            let server = servers
                .0
                .get_mut(&ServerGuildId::from(&meta_data.generics.guild_id))
                .expect("Server should exist");

            if server.audio_player.state.is_paused() {
                delete_now_playing_msg(meta_data).await;
            }

            if let Some(msg) =
                send_embed(&meta_data.generics, now_playing_embed(meta_data), None).await
            {
                meta_data.song.now_playing_msg = Some(NowPlayingMsg {
                    channel_id: msg.channel_id.to_string(),
                    msg_id: msg.id.to_string(),
                });
            }

            // set the audio player status back to play from idle.
            // when a song is started from the queue the "Playable" event is never fired
            // so the audio player status will remain idle from the "End" event being fired
            // additionally we only set it to play when idle because thats the only state the player is in with this scenario
            if server.audio_player.state.is_idle() || server.audio_player.state.is_paused() {
                server.audio_player.play();
            }
        }
        None
    }
}
