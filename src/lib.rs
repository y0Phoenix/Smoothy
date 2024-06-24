use common::SmData;
use serenity::all as serenity;
// Event related imports to detect track creation failures.
use songbird::events::{Event, EventContext, EventHandler as VoiceEventHandler};

pub mod commands;
pub mod executive;
pub mod common;

pub type SmError = Box<dyn std::error::Error + Send + Sync>;
// TODO add delete msg automatically functionality. create a wrapper struct over this to handle this easily
pub type SmContext<'a> = poise::Context<'a, SmData, SmError>;
pub type CommandResult = Result<(), SmError>;

pub struct TrackErrorNotifier;

#[serenity::async_trait]
impl VoiceEventHandler for TrackErrorNotifier {
    async fn act(&self, ctx: &EventContext<'_>) -> Option<Event> {
        if let EventContext::Track(track_list) = ctx {
            for (state, handle) in *track_list {
                println!(
                    "Track {:?} encountered an error: {:?}",
                    handle.uuid(),
                    state.playing
                );
            }
        }
        None
    }
}

/// global event handler for discord
pub async fn event_handler(
    _ctx: &serenity::Context,
    event: &serenity::FullEvent,
    _framework: poise::FrameworkContext<'_, SmData, SmError>,
    data: &SmData,
) -> Result<(), SmError> {
    match event {
        serenity::FullEvent::Ready { data_about_bot, .. } => {
            data.init_bot(data_about_bot.user.id);
            println!("Logged in as {} id: {}", data_about_bot.user.name, data.id.lock().unwrap());
        },
        // on voice channel disconnect
        serenity::FullEvent::VoiceStateUpdate { old: _, new } => {
            if new.channel_id.is_none() {
                let guild_id = new.guild_id.expect("Should have guild_id");
                if new.member.clone().unwrap().user.id == data.id.lock().unwrap().clone() {
                    data.remove_server_db(&guild_id).await;
                }
            }
        },
        _ => {}
    }
    Ok(())
}