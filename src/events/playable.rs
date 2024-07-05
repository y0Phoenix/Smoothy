use serenity::async_trait;
use songbird::events::{Event, EventContext, EventHandler as VoiceEventHandler};

use crate::common::{
    embeds::now_playing_embed,
    message::{delete_now_playing_msg, send_embed, NowPlayingMsg},
    server::{ServerChannelId, ServerGuildId},
    song::TrackMetaData,
};

pub struct SongStartEvent;

// the event that fires when the song starts or is within 5 seconds of starting if next in queue
#[async_trait]
impl VoiceEventHandler for SongStartEvent {
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

            delete_now_playing_msg(meta_data).await;

            server.dc_timer_started = false;
            server.audio_player.play();
            // let curr_song = server.songs.curr_song().unwrap();
            if let Some(msg) =
                send_embed(&meta_data.generics, now_playing_embed(meta_data), None).await
            {
                meta_data.song.now_playing_msg = Some(NowPlayingMsg {
                    channel_id: msg.channel_id.to_string(),
                    msg_id: msg.id.to_string(),
                });
            }
            meta_data.generics.data.inner.update_server_db(server).await;
            meta_data.generics.data.inner.stop_dc_timer(
                ServerGuildId::from(meta_data.generics.guild_id),
                ServerChannelId::from(meta_data.generics.channel_id),
            );
        }
        None
    }
}

