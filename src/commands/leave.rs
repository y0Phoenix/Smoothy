use serenity::all::CreateEmbed;

use crate::{common::{embeds::{err_embed, LEAVING_COLOR}, generics::get_generics, message::send_embed}, CommandResult, SmContext};

#[poise::command(prefix_command, guild_only, aliases("dc", "disconnect", "die"))]
pub async fn leave(ctx: SmContext<'_>) -> CommandResult {
    let generics = get_generics(&ctx);
    let guild_id = ctx.guild_id().unwrap();

    let manager = &ctx.data().inner.songbird;
    let in_vc = manager.get(guild_id).is_some();

    if in_vc {
        if let Err(_err) = manager.remove(guild_id).await {
            send_embed(&generics, err_embed(":cry: Failed to leave vc. Try again later."), Some(60000)).await;
        }

        let embed = CreateEmbed::new().color(LEAVING_COLOR).description(":cry: Left voice channel");
        send_embed(&generics, embed, Some(30000)).await;
    } else {
        send_embed(&generics, err_embed(":rofl: Not in a voice channel"), Some(30000)).await;
    }

    Ok(())
}