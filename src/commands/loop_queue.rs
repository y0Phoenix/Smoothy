use serenity::all::CreateEmbed;
use crate::{common::{checks::is_playing, embeds::{err_embed, GET_SERVER_FAIL_DLT_TIME, GET_SERVER_FAIL_MSG, LOOPED_COLOR}, generics::get_generics, message::send_embed, server::ServerGuildId}, CommandResult, SmContext};

#[poise::command(prefix_command, guild_only, aliases("loop", "l"), check = "is_playing")]
pub async fn loopqueue(ctx: SmContext<'_>) -> CommandResult {
    let generics = get_generics(&ctx);
    
    let mut server_lock = generics.data.inner.servers_unlocked().await;
    let Some(server) = server_lock.0.get_mut(&ServerGuildId::from(generics.guild_id)) else {
        send_embed(&generics, err_embed(GET_SERVER_FAIL_MSG), Some(GET_SERVER_FAIL_DLT_TIME)).await;
        return Ok(());
    };
    
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