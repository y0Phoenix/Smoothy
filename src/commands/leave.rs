use crate::{executive::{get_generics, send_msg}, CommandResult, SmContext};

#[poise::command(prefix_command, guild_only, aliases("dc", "disconnect", "die"))]
pub async fn leave(ctx: SmContext<'_>) -> CommandResult {
    let generics = get_generics(&ctx);
    let guild_id = ctx.guild_id().unwrap();

    let manager = &ctx.data().inner.songbird;
    let has_handler = manager.get(guild_id).is_some();

    if has_handler {
        if let Err(e) = manager.remove(guild_id).await {
            send_msg(&generics, format!("Failed: {:?}", e).as_str(), Some(15000)).await;
        }

        send_msg(&generics, "Left voice channel", Some(15000)).await;
    } else {
        send_msg(&generics, "Not in a voice channel", Some(15000)).await;
    }

    Ok(())
}