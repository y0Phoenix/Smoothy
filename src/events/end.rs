use serenity::{all::CreateEmbed, async_trait};
use songbird::events::{Event, EventContext, EventHandler as VoiceEventHandler};
use tracing::info;

use crate::{common::{embeds::LEAVING_COLOR, message::{delete_now_playing_msg, send_embed}, server::{ServerChannelId, ServerGuildId}, song::{SongType, TrackMetaData}}, executive::init_track};

pub struct SongEndEvent;

// the event that fires when the song ends
#[async_trait]
impl VoiceEventHandler for SongEndEvent {
    async fn act(&self, ctx: &EventContext<'_>) -> Option<Event> {
        if let EventContext::Track(tracks) = ctx {
            info!("Smoothy track end event");
            let track = tracks.first().expect("Should be a track at 0");

            // aquire the meta data on the track for info
            let typemap = track.1.typemap().read().await;
            let meta_data = typemap.get::<TrackMetaData>().expect("Should have metadata");

            delete_now_playing_msg(meta_data).await;

            let mut servers = meta_data.generics.data.inner.servers.lock().await;
            let server = servers.0.get_mut(&ServerGuildId::from(&meta_data.generics.guild_id)).expect("Server should exist");

            // looped queue functionality
            if server.songs.0.looped {
                let manager = meta_data.generics.data.inner.songbird.get(meta_data.generics.guild_id).expect("Should be a valid manager");
                let mut manager_lock = manager.lock().await;

                let track = init_track(meta_data.src.clone(), &meta_data.generics, SongType::DB(meta_data.song.clone()), &mut manager_lock).await.expect("Should initialize track");

                server.songs.0.songs.push(track.1);
            }
            
            // advance our song queue
            server.songs.next_song();
            // stop the audio player to maintain state update
            server.audio_player.stop();
            let no_more_songs = server.songs.0.is_empty();
            if no_more_songs {
                let embed = CreateEmbed::new()
                    .color(LEAVING_COLOR)
                    .description(":x: No more songs to play");
                send_embed(&meta_data.generics, embed, Some(10000)).await;
                info!("No more songs to play in {} starting dc timeout", server.name);
                meta_data.generics.data.inner.start_dc_timer(ServerGuildId::from(meta_data.generics.guild_id), ServerChannelId::from(meta_data.generics.channel_id));
            }
            meta_data.generics.data.inner.update_server_db(server).await;
        }
        None
    }
}