use crate::{
    common::{
        checks::is_playing,
        embeds::{err_embed, now_playing_embed},
        generics::get_generics,
        message::{delete_now_playing_msg, send_embed, NowPlayingMsg},
        song::TrackMetaData,
    },
    CommandResult, SmContext,
};

#[poise::command(guild_only, prefix_command, check = "is_playing", aliases("np"))]
pub async fn now_playing(ctx: SmContext<'_>) -> CommandResult {
    let generics = get_generics(&ctx);

    let Some(manager) = generics.data.inner.songbird.get(generics.guild_id) else {
        send_embed(&generics, err_embed("Something went wrong. Failed to acquire voice manager. Try again later"), Some(75000)).await;
        return Ok(());
    };

    let handler = manager.lock().await;
    let Some(track) = handler.queue().current() else {
        send_embed(&generics, err_embed("Something went wrong. Failed to acquire current song. Try again later"), Some(75000)).await;
        return Ok(());
    };

    let mut typemap = track.typemap().write().await;
    let Some(meta_data) = typemap.get_mut::<TrackMetaData>() else {
        send_embed(&generics, err_embed("Something went wrong. Failed to acquire song info. Try again later"), Some(75000)).await;
        return Ok(());
    };

    if meta_data.song.now_playing_msg.is_some() {
        delete_now_playing_msg(meta_data).await;
    }
    if let Some(msg) = send_embed(&meta_data.generics, now_playing_embed(meta_data), None).await {
        meta_data.song.now_playing_msg = Some(NowPlayingMsg {
            channel_id: msg.channel_id.to_string(),
            msg_id: msg.id.to_string(),
        });
    }
    Ok(())
}
