use crate::{check_msg, CommandResult, SmContext};

#[poise::command(prefix_command, guild_only, aliases("dc", "disconnect", "die"))]
pub async fn leave(ctx: SmContext<'_>) -> CommandResult {
    let guild_id = ctx.guild_id().unwrap();

    let manager = &ctx.data().songbird;
    let has_handler = manager.get(guild_id).is_some();

    if has_handler {
        if let Err(e) = manager.remove(guild_id).await {
            check_msg(ctx.say(format!("Failed: {:?}", e)).await);
        }

        check_msg(ctx.say("Left voice channel").await);
    } else {
        check_msg(ctx.reply("Not in a voice channel").await);
    }

    Ok(())
}