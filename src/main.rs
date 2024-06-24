use std::{env, sync::{mpsc::{self, RecvTimeoutError}, Mutex}, time::{Duration, Instant}};
use std::sync::Arc;

use commands::{leave::leave, play::play};
use common::{DltMsg, Servers, SmData};
use dotenv::dotenv;
use reqwest::Client as HttpClient;
use ::serenity::all::{GatewayIntents, UserId};
use serenity::all as serenity;
use sqlx::PgPool;
use tracing::info;

use smoothy::*;

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
        event_handler: |ctx, event, framework, data| {
            Box::pin(event_handler(ctx, event, framework, data))
        },
        // pre_command: |ctx| {

        // }
        ..Default::default()
    };
    
    // We have to clone our voice manager's Arc to share it between serenity and our user data.
    let manager_clone = Arc::clone(&manager);
    
    // connect to the db
    let pool = PgPool::connect(&db_url).await.expect("Failed to connect to db");
    sqlx::migrate!("./migrations").run(&pool).await.expect("Couldn't run db migrations");

    
    let dlt_msgs = Arc::new(Mutex::new(Vec::new()));
    let dlt_msgs_clone = Arc::clone(&dlt_msgs);
    let dlt_msgs_clone_2 = Arc::clone(&dlt_msgs);
    
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
                    servers: Arc::new(Mutex::new(Servers(std::collections::HashMap::new()))),
                    dlt_msgs: dlt_msgs_clone,
                    id: Arc::new(Mutex::new(UserId::default()))
                },
            )
        })
    });
    
    let intents =
    GatewayIntents::non_privileged() | GatewayIntents::MESSAGE_CONTENT;
    let mut client = serenity::Client::builder(&token, intents)
        .voice_manager_arc(manager)
        .framework(framework)
        .await
        .expect("Err creating client");
    let http_clone = Arc::clone(&client.http);
    let cache_clone = Arc::clone(&client.cache);

    let (dlt_tx, dlt_rx) = mpsc::channel::<DltMsg>();
    let (kill_tx, kill_rx) = mpsc::channel::<bool>();
    let kill_rx_arc = Arc::new(Mutex::new(kill_rx));
    let kill_rx_clone = Arc::clone(&kill_rx_arc);

    tokio::spawn(async move {
        let _ = client
            .start()
            .await
            .map_err(|why| println!("Client ended: {:?}", why));
    });

    tokio::spawn(async move {
        let _signal_err = tokio::signal::ctrl_c().await;
        kill_tx.send(true).unwrap();
    });

    tokio::spawn(async move {
        let mut instant = Instant::now();
        loop {
            match kill_rx_arc.lock().unwrap().recv_timeout(Duration::from_millis(5)) {
                Ok(_) => break,
                Err(err) => match err {
                    RecvTimeoutError::Disconnected => {
                        break;
                    },
                    _ => {}
                }
            }
            let delta = instant.elapsed();
            instant = Instant::now();
            // println!("timer thread");
            let mut dlt_msgs = dlt_msgs.lock().unwrap();
            for msg in dlt_msgs.iter_mut() {
                    msg.timer.tick(delta);
                    // println!("ticking timer for {}", msg.msg.content);
                    if msg.timer.just_finished() {
                        info!("Message {} timer finished sending dlt request", msg.msg.content);
                        let _ = dlt_tx.send(msg.clone());
                    }
            }
        }
    });

    loop {
        match dlt_rx.recv_timeout(Duration::from_millis(5)) {
            Ok(msg) => {
                if let Err(_) = msg.msg.delete(http_clone.clone()).await {
                    let server_name: String = match msg.msg.guild(&cache_clone) {
                        Some(guild) => guild.name.clone(),
                        None => {
                            info!("Error while trying to get guild from Message {}", msg.msg.id);
                            continue;
                        },
                    };
                    info!("There was a problem deleting a message from {server_name}");
                }
                info!("Message {} deleted", msg.msg.id);
                let mut dlt_msgs = dlt_msgs_clone_2.lock().unwrap();
                *dlt_msgs = dlt_msgs.clone().into_iter().filter_map(|dlt_msg| {
                    if dlt_msg.msg.id == msg.msg.id {
                        info!("Removing {} from dlt_msgs", msg.msg.id);
                        return None;
                    }
                    Some(dlt_msg)
                }).collect();
            },
            Err(err) => match err {
                RecvTimeoutError::Disconnected => {
                    break;
                },
                _ => {}
            }
        }
        match kill_rx_clone.lock().unwrap().recv_timeout(Duration::from_millis(5)) {
            Ok(_) => break,
            Err(err) => match err {
                RecvTimeoutError::Disconnected => {
                    break;
                },
                _ => {}
            }
        }
    }

    println!("Received Ctrl-C, shutting down.");
}
