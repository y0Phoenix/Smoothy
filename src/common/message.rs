use std::time::Duration;

use rusty_time::Timer;
use serde::{Deserialize, Serialize};
use serenity::all::Message;
use sqlx::prelude::FromRow;

use crate::Generics;

use super::ClientChannel;

#[derive(Debug, Clone)]
pub struct DltMsg {
    pub msg: Box<Message>,
    pub duration: u64,
    pub timer: Timer
}

#[derive(Debug, Default, FromRow, Serialize, Clone, Deserialize)]
pub struct NowPlayingMsg {
    pub channel_id: String,
    pub msg_id: String
}

/// Checks that a message successfully sent; if not, then logs why to stdout.
pub async fn send_msg(generics: &Generics, msg: &str, millis_dur: Option<u64>) -> Option<Box<Message>> {
    match generics.channel_id.say(generics.http().await, msg).await {
        Ok(msg) => {
            let msg = Box::new(msg);
            if let Some(dur) = millis_dur {
                generics.data.inner.client_tx.send(ClientChannel::DltMsg(DltMsg {
                    msg,
                    duration: dur,
                    timer: Timer::new(Duration::from_millis(dur))
                })).expect("Should be able to send on client_tx channel");
                return None;
            }
            Some(msg)
        },
        Err(why) => {
            println!("Error sending message: {:?}", why);
            None
        }
    }
}