use std::{env, sync::mpsc::{self, RecvTimeoutError}, time::{Duration, Instant}};
use std::sync::Arc;

use commands::{help::help, leave::leave, loop_queue::loopqueue, loop_song::loopsong, next::next, pause::pause, play::play, queue::queue, restart::restart, resume::resume, seek::seek};
use common::{embeds::LEAVING_COLOR, message::{DltMsg, SmMsg}, server::{ServerGuildId, Servers}, ClientChannel, DcTimeOut, SmData, UserData};
use dotenv::dotenv;
use events::event_handler;
use reqwest::Client as HttpClient;
use rusty_time::Timer;
use ::serenity::all::{ActivityData, CreateEmbed, CreateMessage, GatewayIntents, Http, UserId};
use serenity::all as serenity;
use sqlx::PgPool;
use tokio::sync::Mutex;
use tracing::{error, info, warn};

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
    // We have to clone our voice manager's Arc to share it between serenity and our user data.
    let manager_clone = Arc::clone(&manager);
    let manager_clone_main = Arc::clone(&manager);
    
    // Configure our command framework
    let options = poise::FrameworkOptions {
        commands: vec![leave(), play(), next(), queue(), loopsong(), loopqueue(), restart(), seek(), pause(), resume(), help()],
        prefix_options: poise::PrefixFrameworkOptions {
            prefix: Some(String::from("-")),
            ignore_bots: true,
            ..Default::default()
        },
        event_handler: |ctx, event, framework, data| {
            Box::pin(event_handler(ctx, event, framework, data))
        },
        // pre_command: |ctx| {

        // }
        ..Default::default()
    };
    
    // connect to the db
    let pool = PgPool::connect(&db_url).await.expect("Failed to connect to db");
    sqlx::migrate!("./migrations").run(&pool).await.expect("Couldn't run db migrations");

    
    let mut dlt_msgs: Vec<DltMsg> = Vec::new();

    let servers = Arc::new(Mutex::new(Servers(std::collections::HashMap::new())));
    let (client_tx, client_rx) = mpsc::channel::<ClientChannel>();
    
    let framework = poise::Framework::new(options, |_, _, _| {
        Box::pin(async {
            Ok(
                // We create a global HTTP client here to make use of in
                // `~play`. If we wanted, we could supply cookies and auth
                // details ahead of time.
                UserData::new(SmData {
                    reqwest: HttpClient::new(),
                    http: Arc::new(Mutex::new(None)),
                    songbird: manager_clone,
                    db: Arc::new(pool),
                    servers,
                    id: Arc::new(Mutex::new(UserId::default())),
                    client_tx: Arc::new(client_tx),
                }),
            )
        })
    });
    
    let intents =
    GatewayIntents::non_privileged() | GatewayIntents::MESSAGE_CONTENT;
    let mut client = serenity::Client::builder(&token, intents)
        .voice_manager_arc(manager)
        .framework(framework)
        .activity(ActivityData::listening("-help"))
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
    
    let http = http_clone_main;
    let mut instant = Instant::now();
    let mut dc_timers: std::collections::HashMap<ServerGuildId, DcTimeOut> = std::collections::HashMap::new();
    loop {
        let delta = instant.elapsed();
        instant = Instant::now();

        // DLT MSG LOOP
        for msg in dlt_msgs.iter_mut() {
            msg.timer.tick(delta);
            // println!("ticking timer for {}", msg.msg.content);
            if msg.timer.just_finished() {
                // info!("Message {} timer finished sending dlt request", msg.msg.id);
                if (msg.msg.delete(http.clone()).await).is_err() {
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
        
        // DC TIMER LOOP
        for (guild_id, dc_timeout) in dc_timers.iter_mut() {
            // println!("dc timeout");
            dc_timeout.timer.tick(delta);

            if dc_timeout.timer.just_finished() {
                let guild_id = guild_id.guild_id();
                let in_vc = manager_clone_main.get(guild_id).is_some();

                if in_vc {
                    if let Err(e) = manager_clone_main.remove(guild_id).await {
                        warn!("failed to leave vc {}", e);
                    }

                    info!("left vc due to idle in {}", guild_id);
                    send_msg(SmMsg {
                        guild_id,
                        channel_id: dc_timeout.channel_id.channel_id(),
                        content: CreateEmbed::new().color(LEAVING_COLOR).description(":cry: Left vc due to idle")
                    }, &http, Some(30000), &mut dlt_msgs).await;
                } else {
                    info!("DC timer called but not in a vc");
                }
            }
        }
        
        // CLIENT CHANNEL RECIEVER
        match client_rx.recv_timeout(Duration::from_millis(5)) {
            Ok(from_client) => {
                match from_client {
                    ClientChannel::DcTimeOut(dc_timout) => {
                        match dc_timers.get(&dc_timout.guild_id) {
                            Some(_dc_timer) => {
                                if dc_timout.end {
                                    dc_timers.remove(&dc_timout.guild_id).expect("Should be able to remove dc timer");
                                    info!("Removing dc timeout for {}", dc_timout.guild_id.0);
                                }
                            },
                            None => {
                                if !dc_timout.end {
                                    dc_timers.insert(dc_timout.guild_id.clone(),  dc_timout.clone());
                                }
                            },
                        };
                    },
                    ClientChannel::DltMsg(dlt_msg) => dlt_msgs.push(dlt_msg)
                }
            },
            Err(err) => if err == RecvTimeoutError::Disconnected {
                break;
            }
        }

        // KILL EVENT RECIEVER FROM Ctrl-C
        match kill_rx_clone.lock().await.recv_timeout(Duration::from_millis(5)) {
            Ok(_) => break,
            Err(err) => if err == RecvTimeoutError::Disconnected {
                break;
            }
        }
    }

    println!("Received Ctrl-C, shutting down.");
}

async fn send_msg(msg: SmMsg, http: &Http, millis_dur: Option<u64>, dlt_msgs: &mut Vec<DltMsg>) {
    let builder = CreateMessage::new().embed(msg.content);
    match msg.channel_id.send_message(http, builder).await {
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
        Err(why) => {
            error!("Error sending message: {:?}", why);
        }
    }
}
