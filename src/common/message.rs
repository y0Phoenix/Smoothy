use std::{str::FromStr, time::Duration};

use rusty_time::Timer;
use serde::{Deserialize, Serialize};
use serenity::all::{ChannelId, CreateEmbed, CreateMessage, GuildId, Message, MessageId};
use sqlx::prelude::FromRow;
use tracing::info;

use super::{generics::Generics, song::TrackMetaData, ClientChannel};

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

#[derive(Debug, Default)]
pub struct SmMsg {
    pub guild_id: GuildId,
    pub channel_id: ChannelId,
    pub content: CreateEmbed
}

/// Checks that a message successfully sent; if not, then logs why to stdout.
pub async fn send_embed(generics: &Generics, embed: CreateEmbed, millis_dur: Option<u64>) -> Option<Box<Message>> {
    let builder = CreateMessage::new().embed(embed);
    match generics.channel_id.send_message(generics.http().await, builder).await {
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

/// will attempt to delete the now playing msg from the tracks meta_data. this won't panic and will simply not delete the message if something goes wrong
pub async fn delete_now_playing_msg(meta_data: &TrackMetaData) {
    if let Some(now_playing_msg) = &meta_data.song.now_playing_msg.clone() {
        let http = meta_data.generics.data.inner.http.lock().await.clone().expect("Should be an Http initialized");
        let channel_id = ChannelId::from_str(now_playing_msg.channel_id.as_str()).expect("Should be valid ChannelId");
        if let Ok(msg) = channel_id.message(&http, MessageId::from_str(&now_playing_msg.msg_id).expect("Should be a valid MessageId")).await {
            if msg.delete(http).await.is_ok() {
                info!("Message {} deleted", msg.id)
            }
        }
    }
}