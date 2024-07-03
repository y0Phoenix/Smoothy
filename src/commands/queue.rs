use serenity::all::{CreateEmbed, CreateEmbedFooter};

use crate::{common::{checks::is_playing, embeds::{err_embed, LIST_QUEUE_COLOR}, generics::get_generics, message::send_embed, server::ServerGuildId, song::TrackMetaData}, CommandResult, SmContext};

#[poise::command(prefix_command, guild_only, aliases("q"), check = "is_playing")]
pub async fn queue(ctx: SmContext<'_>) -> CommandResult {
    let generics = get_generics(&ctx);

    let songbird = &ctx.data().inner.songbird;
    let manager_lock = songbird.get(generics.guild_id).expect("Manager should exist");
    let manager = manager_lock.lock().await;
    let queue = manager.queue().clone();
    let current_queue = queue.current_queue();

    let servers_lock = generics.data.inner.servers_unlocked().await;
    let Some(server) = servers_lock.0.get(&ServerGuildId::from(generics.guild_id)) else {
        send_embed(&generics, err_embed("Something went wrong. Error obtaining server info, try again later"), Some(75000)).await;
        return Ok(());
    };

    let chunk_size = 10;
    let total_chunks = (current_queue.len() + chunk_size - 1) / chunk_size;
    let mut first_chunk = true;

    for chunk_index in 0..total_chunks {
        let start = chunk_index * chunk_size;
        let end = usize::min(start + chunk_size, current_queue.len());
        let queue_chunk = &current_queue[start..end];

        // only display the title if this is the first chunk
        let mut embed = if first_chunk {
            first_chunk = false;
            CreateEmbed::default()
                .title(format!("{} Song Queue", server.name))
                .color(LIST_QUEUE_COLOR)
                .footer(CreateEmbedFooter::new(if server.songs.0.looped { "Queue is looping" } else { "Not looping queue" }))
        }
        else {
            CreateEmbed::default()
                .color(LIST_QUEUE_COLOR)
                .footer(CreateEmbedFooter::new(if server.songs.0.looped { "Queue is looping" } else { "Not looping queue" }))
        };

        let mut description = String::new();

        for (i, track) in queue_chunk.iter().enumerate() {
            let type_map = track.typemap().read().await;
            let meta_data = type_map.get::<TrackMetaData>().expect("Metadata should exist");

            description.push_str(&format!(
                "***{}***: ***[{}]({})***\nRequested by: <@{}> ***Duration*** {}\n",
                start + i + 1,
                meta_data.song.title,
                meta_data.song.url,
                meta_data.song.requested_by,
                meta_data.song.duration_formatted()
            ));
        }

        embed = embed.description(description);

        send_embed(&generics, embed, Some(120000)).await;
    }

    Ok(())
}