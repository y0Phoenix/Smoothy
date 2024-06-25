use std::{env, str::FromStr, sync::{mpsc::{self, RecvTimeoutError}, Mutex, MutexGuard}, time::{Duration, Instant}};
use std::sync::Arc;

use commands::{leave::leave, next::next, play::play};
use common::{DltMsg, Servers, SmData};
use dotenv::dotenv;
use reqwest::Client as HttpClient;
use rusty_time::Timer;
use ::serenity::all::{ChannelId, GatewayIntents, GuildId, Http, UserId};
use serenity::all as serenity;
use sqlx::PgPool;
use tracing::{info, warn};

use smoothy::*;

#[tokio::main]
async fn main() {
    dotenv().ok();
    tracing_subscriber::fmt::init();

    // Configure the client with your Discord bot token in the environment.
    let token = env::var("DISCORD_TOKEN").expect("Expected a token in the environment");
    // if the current dev env is testing
    let test = env::var("TEST").expect("Expected a TEST bool in the environment").parse::<bool>().expect("Expected TEST environment variable to be a bool");
    let mut db_url = env::var("DB_URL").expect("DB_URL env not set");
    // if the current dev env is testing we should use the test-db as to not interfere with the main smoohty db
    if test {
        db_url = db_url.replace("smoothy", "smoothy-test");
    }

    
    // Create our songbird voice manager
    let manager = songbird::Songbird::serenity();
    
    // Configure our command framework
    let options = poise::FrameworkOptions {
        commands: vec![leave(), play(), next()],
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
    let manager_clone_main = Arc::clone(&manager);
    
    // connect to the db
    let pool = PgPool::connect(&db_url).await.expect("Failed to connect to db");
    sqlx::migrate!("./migrations").run(&pool).await.expect("Couldn't run db migrations");

    
    let dlt_msgs = Arc::new(Mutex::new(Vec::new()));
    let dlt_msgs_main = Arc::clone(&dlt_msgs);

    let servers = Arc::new(Mutex::new(Servers(std::collections::HashMap::new())));
    let servers_timer = Arc::clone(&servers);
    
    let framework = poise::Framework::new(options, |_, _, _| {
        Box::pin(async {
            Ok(
                // We create a global HTTP client here to make use of in
                // `~play`. If we wanted, we could supply cookies and auth
                // details ahead of time.
                SmData {
                    reqwest: HttpClient::new(),
                    http: Arc::new(Mutex::new(None)),
                    songbird: manager_clone,
                    db: Arc::new(pool),
                    servers,
                    generics: Arc::new(Mutex::new(std::collections::HashMap::new())),
                    dlt_msgs,
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
    let http_clone_main = Arc::clone(&client.http);
    let cache_clone_main = Arc::clone(&client.cache);

    let (kill_tx, kill_rx) = mpsc::channel::<bool>();
    let kill_rx_arc = Arc::new(Mutex::new(kill_rx));
    let kill_rx_clone = Arc::clone(&kill_rx_arc);

    tokio::spawn(async move {
        info!("client thread spawned");
        let _ = client
        .start()
        .await
        .map_err(|why| println!("Client ended: {:?}", why));   
    });

tokio::spawn(async move {
        info!("kill check thread spawned");
        let _signal_err = tokio::signal::ctrl_c().await;
        kill_tx.send(true).unwrap();
    });
    
    let http = http_clone_main.clone();
    let mut instant = Instant::now();
    let mut dc_timers: std::collections::HashMap<String, Timer> = std::collections::HashMap::new();
    loop {
        let mut dlt_msgs = dlt_msgs_main.lock().unwrap();
        
        let delta = instant.elapsed();
        instant = Instant::now();
        for msg in dlt_msgs.iter_mut() {
                msg.timer.tick(delta);
                // println!("ticking timer for {}", msg.msg.content);
                if msg.timer.just_finished() {
                    // info!("Message {} timer finished sending dlt request", msg.msg.id);
                    if let Err(_) = msg.msg.delete(http.clone()).await {
                        let server_name: String = match msg.msg.guild(&cache_clone_main) {
                            Some(guild) => guild.name.clone(),
                            None => {
                                warn!("Error while trying to get guild from Message {}", msg.msg.id);
                                continue;
                            },
                        };
                        warn!("There was a problem deleting a message from {server_name}");
                    }
                }
        }
        let mut servers = servers_timer.lock().unwrap();

        for (_, server) in servers.0.iter_mut() {
            if server.dc_timer_started {
                let dc_timer = match dc_timers.get_mut(&server.id) {
                    Some(dc_timer) => dc_timer,
                    None => {
                        // info!("new timer {}", dc_timers.len());
                        dc_timers.insert(server.id.clone(), Timer::new(Duration::from_secs(VC_DC_TIMEOUT_IN_SEC)));
                        // info!("{}", dc_timers.len());
                        dc_timers.get_mut(&server.id.clone()).expect("Timer should exist")
                    }
                };
                dc_timer.tick(delta);
                // info!("ticking dc timer");
                if dc_timer.just_finished() {
                    info!("dc timer finished for {}", server.name);
                    let guild_id = GuildId::from_str(&server.id).expect("Should be a valid GuildId");
                    let has_handler = manager_clone_main.get(guild_id).is_some();

                    if has_handler {
                        if let Err(e) = manager_clone_main.remove(guild_id).await {
                            // send_msg(&generics, format!("Failed: {:?}", e).as_str(), Some(15000)).await;
                            warn!("failed to leave vc {}", e);
                        }

                        info!("left vc");
                        send_msg(SmMsg {
                            guild_id,
                            channel_id: ChannelId::from_str(&server.channel_id).expect("Should be a valid ChannelId"),
                            content: "Left VC due to idle".to_string()
                        }, &http_clone_main, Some(15000), &mut dlt_msgs).await;
                    } else {
                        // send_msg(&generics, "Not in a voice channel", Some(15000)).await;
                    }
                }
            }
            else {
                if let Some(_) = dc_timers.get(&server.id) {
                    info!("removing dc timer {}", server.id);
                    dc_timers.remove(&server.id);
                }
            }
        }
        // if the server was removed while the dc timer is still alive
        if servers.0.len() != dc_timers.len() {
            for (key, _) in dc_timers.clone().iter() {
                if let None = servers.0.get(key) {
                    info!("removing dc timer {}", key);
                    dc_timers.remove(key);
                }
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

async fn send_msg(msg: SmMsg, http: &Http, millis_dur: Option<u64>, dlt_msgs: &mut MutexGuard<'_, Vec<DltMsg>>) {
    match msg.channel_id.say(http, msg.content).await {
        Ok(msg) => {
            let msg = Box::new(msg);
            if let Some(dur) = millis_dur {
                dlt_msgs.push(DltMsg {
                    msg,
                    duration: dur,
                    timer: Timer::new(Duration::from_millis(dur))
                });
            }
        },
        Err(err) => warn!("Error sending message from main {}", err),
    }
}
