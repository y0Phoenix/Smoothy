use crate::{executive::send_msg, CommandResult, SmContext};

#[poise::command(prefix_command, guild_only, aliases("dc", "disconnect", "die"))]
pub async fn leave(ctx: SmContext<'_>) -> CommandResult {
    let guild_id = ctx.guild_id().unwrap();

    let manager = &ctx.data().songbird;
    let has_handler = manager.get(guild_id).is_some();

    if has_handler {
        if let Err(e) = manager.remove(guild_id).await {
            send_msg(ctx, format!("Failed: {:?}", e).as_str(), Some(15000)).await;
        }

        send_msg(ctx, "Left voice channel", Some(15000)).await;
    } else {
        send_msg(ctx, "Not in a voice channel", Some(15000)).await;
    }

    Ok(())
}