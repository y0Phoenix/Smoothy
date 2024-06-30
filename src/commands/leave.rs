use serenity::all::CreateEmbed;

use crate::{common::{embeds::{FAILED_COLOR, LEAVING_COLOR}, message::send_embed}, get_generics, CommandResult, SmContext};

#[poise::command(prefix_command, guild_only, aliases("dc", "disconnect", "die"))]
pub async fn leave(ctx: SmContext<'_>) -> CommandResult {
    let generics = get_generics(&ctx);
    let guild_id = ctx.guild_id().unwrap();

    let manager = &ctx.data().inner.songbird;
    let has_handler = manager.get(guild_id).is_some();

    if has_handler {
        if let Err(e) = manager.remove(guild_id).await {
            let embed = CreateEmbed::new().color(FAILED_COLOR).description(format!("Failed: {:?}", e));
            send_embed(&generics, embed, Some(15000)).await;
        }

        let embed = CreateEmbed::new().color(LEAVING_COLOR).description("Left voice channel");
        send_embed(&generics, embed, Some(15000)).await;
    } else {
        let embed = CreateEmbed::new().color(LEAVING_COLOR).description("Not in a voice channel");
        send_embed(&generics, embed, Some(15000)).await;
    }

    Ok(())
}