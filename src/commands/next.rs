use serenity::all::CreateEmbed;

use crate::{common::{checks::vc, embeds::{err_embed, SKIPPING_COLOR}, message::send_embed}, get_generics, CommandResult, SmContext};

#[poise::command(prefix_command, guild_only, aliases("n", "next", "skip", "s"), check = "vc")]
pub async fn next(ctx: SmContext<'_>) -> CommandResult {
    let generics = get_generics(&ctx);

    let curr_song = generics.data.inner.curr_song(&generics.guild_id).await.expect("Should be a current song");

    let embed = CreateEmbed::new()
        .color(SKIPPING_COLOR)
        .title(":next_track: Skipping")
        .description(format!("[{}]({})", curr_song.title, curr_song.url));
    send_embed(&generics, embed, Some(30000)).await;

    if let Err(err) = generics.data.inner.next_song(&generics.guild_id).await {
        send_embed(&generics, err_embed(err), Some(60000)).await;
    }

    Ok(())
}