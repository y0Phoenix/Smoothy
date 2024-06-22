use songbird::TrackEvent;
use tracing::info;

use crate::{SmContext, TrackErrorNotifier};

pub type ExecResult = Result<(), &'static str>;

pub async fn join(ctx: SmContext<'_>) -> ExecResult {
    let (guild_id, channel_id) = {
        let guild = ctx.guild().unwrap();
        let channel_id = guild
            .voice_states
            .get(&ctx.author().id)
            .and_then(|voice_state| voice_state.channel_id);

        (guild.id, channel_id)
    };

    let connect_to = match channel_id {
        Some(channel) => channel,
        None => {
            check_msg(ctx.reply("You're not in a voice channel").await);
            let err_msg = "Failed to join voice channel. User not in channel";
            info!("{err_msg}");
            return Err(err_msg);
        },
    };

    let manager = &ctx.data().songbird;
    if let Ok(handler_lock) = manager.join(guild_id, connect_to).await {
        // Attach an event handler to see notifications of all track errors.
        let mut handler = handler_lock.lock().await;
        handler.add_global_event(TrackEvent::Error.into(), TrackErrorNotifier);
    }

    Ok(())
}

/// Checks that a message successfully sent; if not, then logs why to stdout.
pub fn check_msg<T>(result: serenity::Result<T>) {
    if let Err(why) = result {
        println!("Error sending message: {:?}", why);
    }
}