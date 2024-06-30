use crate::{common::{checks::vc, message::send_msg}, get_generics, CommandResult, SmContext};

#[poise::command(prefix_command, guild_only, aliases("n", "next", "skip", "s"), check = "vc")]
pub async fn next(ctx: SmContext<'_>) -> CommandResult {
    let generics = get_generics(&ctx);

    send_msg(&generics, format!("Skipping {}", generics.data.inner.curr_song(&generics.guild_id).await.expect("Should be a current song").title).as_str(), Some(30000)).await;

    if let Err(err) = generics.data.inner.next_song(&generics.guild_id).await {
        send_msg(&generics, &err, Some(60000)).await;
    }

    Ok(())
}