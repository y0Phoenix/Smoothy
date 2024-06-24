use std::time::Duration;
use rusty_time::Timer;
use serenity::all::{ChannelId, Http};
use songbird::TrackEvent;
use sqlx::types::Json;
use tracing::info;

use crate::{common::{DltMsg, Server, SmData, Songs}, SmContext, SmError, TrackErrorNotifier};

pub type ExecResult = Result<bool, SmError>;

pub async fn join(ctx: SmContext<'_>) -> ExecResult {
    let generics = get_generics(ctx);
    let (guild_id, channel, name) = {
        let guild = ctx.guild().unwrap();
        let name = guild.name.clone();
        let channel_id = guild
            .voice_states
            .get(&ctx.author().id)
            .and_then(|voice_state| voice_state.channel_id);

        (guild.id, channel_id, name)
    };

    let connect_to = match channel {
        Some(channel) => channel,
        None => {
            send_msg(&generics, "You're not in a voice channel", Some(15000)).await;
            let err_msg = "Failed to join voice channel. User not in channel";
            info!("{err_msg}");
            return Ok(false);
        },
    };

    if let None = generics.data.get_server(&guild_id) {
        generics.data.add_server_db(Server {
            id: guild_id.to_string(),
            channel_id: ctx.channel_id().to_string(),
            voice_channel_id: connect_to.to_string(),
            name,
            songs: Json(Songs(Vec::new())),
        }).await;
    }

    // data.print_servers();

    let manager = &ctx.data().songbird;
    if let Ok(handler_lock) = manager.join(guild_id, connect_to).await {
        // Attach an event handler to see notifications of all track errors.
        let mut handler = handler_lock.lock().await;
        handler.add_global_event(TrackEvent::Error.into(), TrackErrorNotifier);
    }
    Ok(true)
}

/// Checks that a message successfully sent; if not, then logs why to stdout.
pub async fn send_msg(generics: &Generics<'_>, msg: &str, millis_dur: Option<u64>) {
    match generics.channel_id.say(generics.http, msg).await {
        Ok(msg) => {
            if let Some(dur) = millis_dur {
            let mut dlt_msgs = generics.data.dlt_msgs.lock().unwrap();
            dlt_msgs.push(DltMsg {
                msg: Box::new(msg),
                duration: dur,
                timer: Timer::new(Duration::from_millis(dur))
            })
            }
        },
        Err(why) => println!("Error sending message: {:?}", why)
    }
}

pub struct Generics<'a> {
    pub channel_id: ChannelId,
    pub http: &'a Http,
    pub data: &'a SmData
}

pub fn get_generics(ctx: SmContext<'_>) -> Generics {
    Generics {
        channel_id: ctx.channel_id(),
        http: ctx.http(),
        data: ctx.data(),
    }
}