use std::{env, sync::Mutex, thread, time::Instant};
use std::sync::Arc;

use commands::{leave::leave, play::play};
use common::{Server, SmData};
use dotenv::dotenv;
use futures::executor::block_on;
use reqwest::Client as HttpClient;
use ::serenity::all::GatewayIntents;
use serenity::all as serenity;
use smoothy::*;

use sqlx::PgPool;
use tracing::info;

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
    let db_url = env::var("DB_URL").expect("DB_URL env not set");

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

    // connect to the db
    let pool = PgPool::connect(&db_url).await.expect("Failed to connect to db");
    let dlt_msgs = Arc::new(Mutex::new(Vec::new()));
    let dlt_msgs_clone = Arc::clone(&dlt_msgs);
    
    let framework = poise::Framework::new(options, |_, _, _| {
        Box::pin(async {
            Ok(
                // We create a global HTTP client here to make use of in
                // `~play`. If we wanted, we could supply cookies and auth
                // details ahead of time.
                SmData {
                    http: HttpClient::new(),
                    songbird: manager_clone,
                    db: pool,
                    server: Server::default(),
                    dlt_msgs: dlt_msgs_clone
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
    let http_clone = Arc::clone(&client.http);
    let cache_clone = Arc::clone(&client.cache);

    tokio::spawn(async move {
        let _ = client
            .start()
            .await
            .map_err(|why| println!("Client ended: {:?}", why));
    });
    thread::spawn(move || {
        let mut instant = Instant::now();
        loop {
            let delta = instant.elapsed();
            instant = Instant::now();
            let mut dlt_msgs = dlt_msgs.lock().unwrap();
            *dlt_msgs = dlt_msgs.iter_mut()
                .filter_map(|msg| {
                    msg.timer.tick(delta);
                    if msg.timer.just_finished() {
                        let delete_result = msg.msg.delete(http_clone.clone());
                        if let Err(_) = block_on(delete_result) {
                            let server_name: &String = match msg.msg.guild(&cache_clone) {
                                Some(guild) => &guild.clone().name,
                                None => {
                                    info!("Error while trying to get guild from msg {}", msg.msg.content);
                                    return Some(msg.clone()); // Clone the message here
                                },
                            };
                            info!("There was a problem deleting a message from {server_name}");
                            return Some(msg.clone()); // Clone the message here
                        }
                        info!("Message {} deleted", msg.msg.content);
                        None
                    } else {
                        Some(msg.clone()) // Clone the message here
                    }
                })
                .collect();
        }
    });

    let _signal_err = tokio::signal::ctrl_c().await;
    println!("Received Ctrl-C, shutting down.");
}
