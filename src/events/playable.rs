use serenity::{all::{CreateEmbed, CreateEmbedAuthor}, async_trait};
use songbird::events::{Event, EventContext, EventHandler as VoiceEventHandler};

use crate::common::{embeds::NOW_PLAYING_COLOR, message::{delete_now_playing_msg, send_embed, NowPlayingMsg}, server::{ServerChannelId, ServerGuildId}, song::TrackMetaData};

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
            let meta_data = typemap.get_mut::<TrackMetaData>().expect("Should have metadata");

            let mut servers = meta_data.generics.data.inner.servers.lock().await;
            let server = servers.0.get_mut(&ServerGuildId::from(&meta_data.generics.guild_id)).expect("Server should exist");

            delete_now_playing_msg(meta_data).await;

            server.dc_timer_started = false;
            server.audio_player.play();
            // let curr_song = server.songs.curr_song().unwrap();
            let embed = CreateEmbed::new()
                .color(NOW_PLAYING_COLOR)
                .author(CreateEmbedAuthor::new("Now Playing").icon_url("https://cdn.discordapp.com/attachments/778600026280558617/781024479623118878/ezgif.com-gif-maker_1.gif"))
                .description(format!("***[{}]({})***", meta_data.song.title, meta_data.song.url))
                .field("Requested by", format!("<@{}>", meta_data.song.requested_by), true)
                .field("Duration", meta_data.song.duration_formatted().to_string(), true)
                .thumbnail(meta_data.song.thumbnail.clone())
            ;
            if let Some(msg) = send_embed(&meta_data.generics, embed, None).await {
                meta_data.song.now_playing_msg = Some(NowPlayingMsg {
                    channel_id: msg.channel_id.to_string(),
                    msg_id: msg.id.to_string()
                });
            }
            meta_data.generics.data.inner.update_server_db(server).await;
            meta_data.generics.data.inner.stop_dc_timer(ServerGuildId::from(meta_data.generics.guild_id), ServerChannelId::from(meta_data.generics.channel_id));
        }
        None
    }
}