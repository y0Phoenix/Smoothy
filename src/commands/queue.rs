use serenity::all::CreateEmbed;

use crate::{common::{checks::is_playing, embeds::LIST_QUEUE_COLOR, message::send_embed}, get_generics, CommandResult, SmContext, TrackMetaData};

#[poise::command(prefix_command, guild_only, aliases("q"), check = "is_playing")]
pub async fn queue(ctx: SmContext<'_>) -> CommandResult {
    let generics = get_generics(&ctx);

    let songbird = &ctx.data().inner.songbird;
    let manager_lock = songbird.get(generics.guild_id).expect("Manager should exist");
    let manager = manager_lock.lock().await;
    let queue = manager.queue().clone();
    let current_queue = queue.current_queue();
    let queue_msg_count = if (current_queue.len() / 10) <= 0 { 1 } else { current_queue.len() / 10 };

    if current_queue.is_empty() {
        generics.channel_id.say(&ctx.http(), "The queue is currently empty.").await.unwrap();
        return Ok(());
    }

    let mut embed = CreateEmbed::default()
        .title(format!("{} Song Queue", generics.guild_id.name(ctx.cache()).expect("Server name should exist")))
        .color(LIST_QUEUE_COLOR)    
    ;
    let mut queue_list = Vec::new(); 
    for _i in 0..queue_msg_count {
        queue_list.push(String::new());
    }
    let mut old_index = 0;
    for (i, track) in current_queue.iter().enumerate() {
        let type_map = track.typemap().read().await;
        let meta_data = type_map.get::<TrackMetaData>().expect("Metadata should exist");
        let queue_list_index = if (i / 10) <= 0 { 0 } else { (i / 10) - 1 };
        let queue_msg = queue_list.get_mut(queue_list_index).expect("Queue msg should exist");

        queue_msg.push_str(format!(
            "***{}***: ***[{}]({})***\nRequested by: <@{}> ***Duration*** {}\n",
            i + 1,
            meta_data.song.title,
            meta_data.song.url,
            meta_data.song.requested_by,
            meta_data.song.duration_formatted()
        ).as_str());
        if old_index < queue_list_index {
            embed = embed.clone().description(queue_msg.clone());
            old_index = queue_list_index;
            send_embed(&generics, embed, Some(120000)).await;
            embed = CreateEmbed::new().color(LIST_QUEUE_COLOR);
        }
    }

    let queue_msg = queue_list.get(queue_msg_count - 1).expect("Should be a queue msg");
    send_embed(&generics, embed.description(queue_msg.clone()), Some(120000)).await;

    Ok(())
} 