use serenity::all::CreateEmbed;

use crate::{executive::{get_generics, is_playing, send_msg}, CommandResult, SmContext, TrackMetaData};

#[poise::command(prefix_command, guild_only, aliases("n", "next", "skip", "s"), check = "is_playing")]
pub async fn queue(ctx: SmContext<'_>) -> CommandResult {
    let generics = get_generics(&ctx);

    let songbird = &ctx.data().inner.songbird;
    let manager_lock = songbird.get(generics.guild_id).expect("Manager should exist");
    let manager = manager_lock.lock().await;

    let queue = manager.queue().clone();
    let current_queue = queue.current_queue();

    if current_queue.is_empty() {
        generics.channel_id.say(&ctx.http(), "The queue is currently empty.").await.unwrap();
        return Ok(());
    }

    let mut embed = CreateEmbed::default();
    embed = embed.title("Track Queue");

    for (i, track) in current_queue.iter().enumerate() {
        let type_map = track.typemap().read().await;
        let meta_data = type_map.get::<TrackMetaData>().expect("Metadata should exist");
        embed = embed.field(format!("Track {}", i + 1), meta_data.song.title.clone(), false);
    }


    send_msg(&generics, format!("Here is the queue {}", generics.data.inner.curr_song(&generics.guild_id).await.expect("Should be a current song").title).as_str(), Some(30000)).await;

    if let Err(err) = generics.data.inner.next_song(&generics.guild_id).await {
        send_msg(&generics, &err, Some(60000)).await;
    }

    Ok(())
} 