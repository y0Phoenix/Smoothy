use crate::{executive::{get_generics, is_playing, send_msg}, CommandResult, SmContext};

#[poise::command(prefix_command, guild_only, aliases("n", "next", "skip", "s"), check = "is_playing")]
pub async fn next(ctx: SmContext<'_>) -> CommandResult {
    let generics = get_generics(&ctx);
    
    // if let Err(_) = generics.data.stop_player(&generics.guild_id).await {
    //     send_msg(&generics, "Failed to goto next song", Some(30000)).await;
    //     return Ok(());
    // }

    // let http = ctx.data().inner.http.lock().unwrap().clone().unwrap();

    send_msg(&generics, format!("Skipping {}", generics.data.inner.curr_song(&generics.guild_id).unwrap().title).as_str(), Some(30000)).await;

    if let Err(err) = generics.data.inner.next_song(&generics.guild_id).await {
        send_msg(&generics, &err, Some(60000)).await;
    }

    Ok(())
}