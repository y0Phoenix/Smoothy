use std::env;
use std::sync::Arc;

use commands::{leave::leave, play::play};
use dotenv::dotenv;
use executive::check_msg;
use ::serenity::all::GatewayIntents;
use serenity::all as serenity;

// Event related imports to detect track creation failures.
use songbird::events::{Event, EventContext, EventHandler as VoiceEventHandler};

// YtDl requests need an HTTP client to operate -- we'll create and store our own.
use reqwest::Client as HttpClient;

mod commands;
mod executive;

pub struct UserData {
    http: HttpClient,
    songbird: Arc<songbird::Songbird>,
}

pub type SmError = Box<dyn std::error::Error + Send + Sync>;
// TODO add delete msg automatically functionality. create a wrapper struct over this to handle this easily
pub type SmContext<'a> = poise::Context<'a, UserData, SmError>;
pub type CommandResult = Result<(), SmError>;

struct Handler;

#[serenity::async_trait]
impl serenity::EventHandler for Handler {
    async fn ready(&self, _: serenity::Context, ready: serenity::Ready) {
        println!("{} is connected!", ready.user.name);
    }
}

#[tokio::main]
async fn main() {
    dotenv().ok();
    tracing_subscriber::fmt::init();

    // Configure the client with your Discord bot token in the environment.
    let token = env::var("DISCORD_TOKEN").expect("Expected a token in the environment");

    // Create our songbird voice manager
    let manager = songbird::Songbird::serenity();

    // Configure our command framework
    let options = poise::FrameworkOptions {
        commands: vec![leave(), play()],
        prefix_options: poise::PrefixFrameworkOptions {
            prefix: Some(String::from("-")),
            ..Default::default()
        },
        ..Default::default()
    };

    // We have to clone our voice manager's Arc to share it between serenity and our user data.
    let manager_clone = Arc::clone(&manager);
    let framework = poise::Framework::new(options, |_, _, _| {
        Box::pin(async {
            Ok(
                // We create a global HTTP client here to make use of in
                // `~play`. If we wanted, we could supply cookies and auth
                // details ahead of time.
                UserData {
                    http: HttpClient::new(),
                    songbird: manager_clone,
                },
            )
        })
    });

    let intents =
        GatewayIntents::non_privileged() | GatewayIntents::MESSAGE_CONTENT;
    let mut client = serenity::Client::builder(&token, intents)
        .voice_manager_arc(manager)
        .event_handler(Handler)
        .framework(framework)
        .await
        .expect("Err creating client");

    tokio::spawn(async move {
        let _ = client
            .start()
            .await
            .map_err(|why| println!("Client ended: {:?}", why));
    });

    let _signal_err = tokio::signal::ctrl_c().await;
    println!("Received Ctrl-C, shutting down.");
}
struct TrackErrorNotifier;

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
