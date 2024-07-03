use std::sync::Arc;

use serenity::all::{ChannelId, GuildId, Http};
use songbird::typemap::TypeMapKey;

use crate::SmContext;

use super::{server::{ServerGuildId, ServersLock}, UserData};


#[derive(Debug, Clone)]
pub struct Generics {
    pub channel_id: ChannelId,
    pub data: UserData,
    pub guild_id: GuildId
}

impl Generics {
    pub async fn http(&self) -> Arc<Http> {
        self.data.inner.http.lock().await.clone().unwrap()
    }
    pub fn from_user_data(data: &UserData, guild_id: &GuildId, servers_lock: &mut ServersLock<'_>) -> Self {
        let server = servers_lock.0.get_mut(&ServerGuildId::from(guild_id)).expect("Server should exist");
        Self { 
            channel_id: server.channel_id.channel_id(),
            data: data.clone(),
            guild_id: *guild_id
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