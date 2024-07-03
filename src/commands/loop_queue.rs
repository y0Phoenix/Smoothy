use serenity::all::CreateEmbed;
use crate::{common::{checks::is_playing, embeds::{err_embed, GET_SERVER_FAIL_DLT_TIME, GET_SERVER_FAIL_MSG, LOOPED_COLOR}, generics::get_generics, message::send_embed, server::ServerGuildId, song::TrackMetaData}, CommandResult, SmContext};

#[poise::command(prefix_command, guild_only, aliases("loop", "l"), check = "is_playing")]
pub async fn loopqueue(ctx: SmContext<'_>) -> CommandResult {
    let generics = get_generics(&ctx);
    
    let mut server_lock = generics.data.inner.servers_unlocked().await;
    let Some(server) = server_lock.0.get_mut(&ServerGuildId::from(generics.guild_id)) else {
        send_embed(&generics, err_embed(GET_SERVER_FAIL_MSG), Some(GET_SERVER_FAIL_DLT_TIME)).await;
        return Ok(());
    };

    let manager = generics.data.inner.songbird.get(generics.guild_id).expect("Should be a valid 'Call'");
    let manager_lock = manager.lock().await;
    let track = manager_lock.queue().current().expect("Should be a current song");
    let mut typemap = track.typemap().write().await;
    let meta_data = typemap.get_mut::<TrackMetaData>().expect("Track should have meta data");

    if meta_data.looped {
        if track.disable_loop().is_err() {
            send_embed(&generics, err_embed(":cry: Failed to disable song loop before looping queue. Try again later"), Some(120000)).await;
            return Ok(());
        }
        meta_data.looped = false;
    }
    
    
    let description = if server.songs.0.looped {
        format!(":thumbsup: No longer looping the {} queue", server.name)
    }
    else {
        format!(":thumbsup: Looping the {} queue", server.name)
    };
    server.songs.0.looped = !server.songs.0.looped;

    send_embed(&generics, CreateEmbed::new().color(LOOPED_COLOR).description(description), Some(60000)).await;

    Ok(())
}