use std::{sync::Arc, time::Duration};
use rusty_time::Timer;
use serenity::all::{ChannelId, GuildId, Http, Message};
use songbird::typemap::TypeMapKey;
use sqlx::types::Json;
use tracing::info;

use crate::{add_global_events, common::{ClientChannel, DltMsg, Server, ServerChannelId, ServerGuildId, Songs, UserData}, SmContext, SmError};

pub type ExecResult = Result<bool, SmError>;

pub async fn join(ctx: SmContext<'_>) -> ExecResult {
    let generics = Generics { 
        channel_id: ctx.channel_id(),
        data: ctx.data().clone(),
        guild_id: ctx.guild_id().expect("GuildId should exist")
    };
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

    if let None = generics.data.inner.get_server(&guild_id) {
        generics.data.inner.add_server_db(Server {
            id: ServerGuildId::from(&guild_id),
            channel_id: ServerChannelId::from(&ctx.channel_id()),
            voice_channel_id: ServerChannelId::from(&connect_to),
            name,
            songs: Json(Songs(Vec::new())),
            ..Default::default()
        }).await;
    }

    // data.print_servers();

    let manager = &ctx.data().inner.songbird;
    if let Ok(handler_lock) = manager.join(guild_id, connect_to).await {
        // Attach an event handler to see notifications of all track errors.
        let handler = handler_lock.lock().await;
        add_global_events(handler, &generics);
    }
    Ok(true)
}

pub async fn is_playing(ctx: SmContext<'_>) -> ExecResult {
    let generics = get_generics(&ctx);

    if let Some(server) = generics.data.inner.get_server(&ctx.guild_id().expect("Should be a GuildId")) {
        match server.audio_player.state {
            crate::common::AudioPlayerState::Playing => return Ok(true),
            crate::common::AudioPlayerState::Idle => send_msg(&generics, "Not currently playing a song", Some(30000)).await,
            crate::common::AudioPlayerState::Paused => send_msg(&generics, "Player is currently paused", Some(30000)).await,
            crate::common::AudioPlayerState::Skipped => send_msg(&generics, "Player is skipping", Some(30000)).await,
        };
        return Ok(false);
    } else {
        send_msg(&generics, "Not Currently In A Voice Channel", Some(30000)).await;
    }
    Ok(false)
}

/// Checks that a message successfully sent; if not, then logs why to stdout.
pub async fn send_msg(generics: &Generics, msg: &str, millis_dur: Option<u64>) -> Option<Box<Message>> {
    match generics.channel_id.say(generics.http(), msg).await {
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

#[derive(Debug, Clone)]
pub struct Generics {
    pub channel_id: ChannelId,
    pub data: UserData,
    pub guild_id: GuildId
}

impl Generics {
    fn http(&self) -> Arc<Http> {
        self.data.inner.http.lock().unwrap().clone().unwrap()
    }
    pub fn from_user_data(data: &UserData, guild_id: &GuildId) -> Self {
        let server = data.inner.get_server(guild_id).expect("Server should exist");
        Self { 
            channel_id: server.channel_id.channel_id(),
            data: data.clone(),
            guild_id: guild_id.clone()
        }
    }
}

impl TypeMapKey for Generics {
    type Value = Generics;
}

pub fn get_generics(ctx: &SmContext<'_>) -> Generics {
    let data = ctx.data();
    Generics {
        channel_id: ctx.channel_id(),
        data: data.clone(),
        guild_id: ctx.guild_id().expect("GuildId should exist")
    }
}