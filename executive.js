//executive file holds all the executive functions and is the largest file
const ytSearch = require('yt-search');
const ytdl = require('ytdl-core');
var {AudioPlayerStatus,
	StreamType,
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
    getVoiceConnection,
    VoiceConnectionStatus,
    } = require('@discordjs/voice');
const { MessageEmbed } = require('discord.js');
var voiceConnection = undefined;
var video = undefined;
var videoURL = undefined;
var yturl = undefined;
var videoName = undefined;

//disconnects from voiceConnection after 1800000 ms or 30 min
function disconnectvcidle(serverQueue, queue, DisconnectIdle, serverDisconnectIdle){
    serverDisconnectIdle.voiceConnection.disconnect();
    if(serverQueue !== undefined){
        queue.delete(serverQueue.message.guild.id);
    }
    DisconnectIdle.delete(serverDisconnectIdle.message.guild.id);
    serverDisconnectIdle.message.channel.send(':cry: Left VC Due To Idle :cry:');
}

//starts the timer for 1800000 ms or 30 min which disconnects from voiceConnection
// this timer only starts when the audioPlayer is Idle 
function disconnectTimervcidle(serverQueue, queue, DisconnectIdle, serverDisconnectIdle){
    serverDisconnectIdle.disconnectTimer = setTimeout(disconnectvcidle, 1800000, serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
    console.log('Starting disconnectTimer Timeout');
}

//creates the serverQueue which stores info about the songs, voiceConnection, audioPlayer, subscription, and textChannel
function createServerQueue(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue){
    serverDisconnectIdle = DisconnectIdle.get(message.guild.id)
    if(serverDisconnectIdle.disconnectTimer !== undefined){
        clearTimeout(serverDisconnectIdle.disconnectTimer)
        console.log('Cleared Timout For disconnectTimer')
    }    
        //checks if a serverQueue exists if it doesn't it creates the queue, else the song is pushed into serverQueue.songs
        if(!serverQueue){
            songobject = {
                video: video,
                videoURL: videoURL,
                url: videoURL.videoDetails.embed.flashSecureUrl,
                title: videoURL.videoDetails.title,
                thumbnail: videoURL.videoDetails.thumbnails[2].url,
                message: message,
                args: args
            };
            currentsongobject = {
                video: video,
                videoURL: videoURL,
                url: videoURL.videoDetails.embed.flashSecureUrl,
            }
            const player = createAudioPlayer();
            console.log('created the audio player');
            const subscription = voiceConnection.subscribe(player);
            console.log('subscribed to Player');
            construct = {
                message: message,
                voiceChannel: message.member.voice.channel,
                voiceConnection: voiceConnection,
                textChannel: message.channel,
                songs: [songobject],
                currentsong: [currentsongobject],
                player: player,
                subscription: subscription,
                currenttitle: undefined,
                loop: false,
                loopsong: false,
                repeat: false,
            };
            //when the audioPlayer for this construct inside serverQueue is Idle the function is executed
            construct.player.on(AudioPlayerStatus.Idle, (playerEvent) =>{
                console.log('Player Status Is Idle');
                //resource.metadata is set inside of the async play function
                var localServerQueue = playerEvent.resource.metadata;               
                //normal song ending when loop and loopsong are false
                if(localServerQueue.loop === false && localServerQueue.loopsong === false){
                    localServerQueue.currentsong.shift();
                    serverQueue.songs.shift();
                    if(localServerQueue.songs.length > 0) {
                        playNext(localServerQueue, queue);
                    }
                    else {
                        localServerQueue.message.channel.send(':x: No More Songs To Play :x:');
                        serverDisconnectIdle = DisconnectIdle.get(localServerQueue.message.guild.id);
                        queue.delete(localServerQueue.message.guild.id);
                        disconnectTimervcidle(localServerQueue, queue, DisconnectIdle, serverDisconnectIdle);
                    }
                }
                //song ending while loop is true and loopsong is false
                else if(localServerQueue.loop === true && localServerQueue.loopsong === false){
                    localServerQueue.currentsong.shift();
                    loopNextSong(localServerQueue);
                    console.log('Playing Next Song In Looped Queue');
                }
                //song ending whil loopsong is true
                else if(localServerQueue.loopsong === true){
                        console.log('Playing Looped Current Song');
                        playNext(localServerQueue, queue);
                }
                //song ending while repeat is true
                else{
                    if(serverQueue.repeat === true){
                        playNext(localServerQueue, queue);
                        serverQueue.repeat = false;
                    }
                }
                    
            });
            queue.set(message.guild.id, construct);
            serverQueue = queue.get(message.guild.id)
            play(serverQueue); 
        }else{
            serverQueue.songs.push({video: video, videoURL: videoURL, url: videoURL.videoDetails.embed.flashSecureUrl, 
                title: videoURL.videoDetails.title, thumbnail: videoURL.videoDetails.thumbnails[0].url,
                message: message, args: args});
            const addQueueEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(':thumbsup: Song Added To Queue')
                .setURL(`${videoURL.videoDetails.embed.flashSecureUrl}`)
                .setDescription(`***${videoURL.videoDetails.title}***
                Has Been Added To The Queue :arrow_down:`)
                .addField(`Requested By` , `<@${message.author.id}>`)
                .setThumbnail(`${videoURL.videoDetails.thumbnails[0].url}`)
                .setTimestamp()
            message.reply({embeds: [addQueueEmbed]});
            console.log(videoURL.videoDetails.title + " has been added to the queue!");
        }
}

//created the stream using ytdl-core, connects it to an audioResource then plays the resource inside of serverQueue.player
async function play(serverQueue) {
    yturl = ytdl.validateURL(serverQueue.songs[0].videoURL.videoDetails.embed.flashSecureUrl) ? true : false;
    if(yturl === true){
        const stream = ytdl(serverQueue.currentsong[0].url,{ 
            highWaterMark: 33554, 
            filter: 'audioonly', 
            quality: 'highestaudio',
            // requestOptions: {
            //     headers: {
            //         cookie: process.env.YOUTUBE_LOGIN_COOKIE,
            //     },
            // },
        });
        const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
        resource.metadata = serverQueue;
        await serverQueue.player.play(resource);
        console.log("Playing " + serverQueue.songs[0].title + "!");
        serverQueue.currenttitle = serverQueue.songs[0].title;
        if(serverQueue.loopsong === false){
            const playembed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`:thumbsup: Now Playing`)
                .setURL(`${serverQueue.songs[0].url}`)
                .setDescription(`:musical_note: ***${serverQueue.currenttitle}*** :musical_note:`)
                .addField(`Requested By` , `<@${serverQueue.songs[0].message.author.id}>`)
                .setThumbnail(`${serverQueue.songs[0].thumbnail}`)
                .setTimestamp()
            ;
            serverQueue.songs[0].message.reply({embeds: [playembed]});
        }
    }
    else{
        serverQueue.message.channel.send(`***${serverQueue.songs[0].title}*** Was Not Valid`)
        serverQueue.player.stop();
    }
}

//searches for the song again to ensure it exists then plays that song at the play function
async function playNext(serverQueue) {
    if (serverQueue.songs.length > 0) {
        await findvideo(serverQueue)
        play(serverQueue);
    } 
}

//finds the song again to ensure it exists then sets a constant to the song in front of the queue and pushes that song to the back, which makes a looped song queue
async function loopNextSong(serverQueue){
    await findvideo(serverQueue)
    const currentsong = serverQueue.songs[0]
    serverQueue.songs.shift();
    serverQueue.songs.push(currentsong);
    play(serverQueue)
}

//finds the song specified in args
async function findvideo(serverQueue){
    if (serverQueue.loop === true && serverQueue.songs.length > 1){
        videoName = serverQueue.songs[1].args.join(' ');
    }
    else{
        videoName = serverQueue.songs[0].args.join(' ');
    }
    const videoFinder = async (query) => {
        const videoResult = await ytSearch(query);
        return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
    }
    video = await videoFinder(videoName);
    if(video){
        videoURL = await ytdl.getInfo(video.url);
    }
    else{
        videoURL = await ytdl.getInfo(videoName);
    }
    serverQueue.currentsong.push({video: video, videoURL: videoURL, 
        url: videoURL.videoDetails.embed.flashSecureUrl, })
}

module.exports = {
    name: 'executive',
    description: 'executive functions',
    //this function only gets called from commands/play.js. It finds the song specified in args 
    async FindVideoCheck(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue){
        videoName = args.join(' ');
        const videoFinder = async (query) => {
            const videoResult = await ytSearch(query);
            return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
        }
        video = await videoFinder(videoName);

        if(video){
            videoURL = await ytdl.getInfo(video.url);
            yturl = ytdl.validateURL(videoURL.videoDetails.embed.flashSecureUrl) ? true : false;
            if (yturl === true){
                createServerQueue(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue);
            }
        }
        else{
            if(videoURL){
                videoURL = await ytdl.getInfo(videoName);
                yturl = ytdl.validateURL(videoURL.videoDetails.embed.flashSecureUrl) ? true : false;
                if (yturl === true){
                    createServerQueue(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue);
                }
            }else{
                message.channel.send(':rofl: No ***video*** results found :rofl:');
                return;
            }
        }   
    },
    //joins the voiceChannel only when voiceConnection is disconnected
    async joinvoicechannel(message, vc, DisconnectIdle, serverDisconnectIdle){
        if (VoiceConnectionStatus.Disconnected) 
                voiceConnection = joinVoiceChannel({
                    channelId: vc.id,
                    guildId: vc.guild.id,
                    adapterCreator: vc.guild.voiceAdapterCreator
                });
        //sets the DisconnectIdle map 
        if(!serverDisconnectIdle){
            DisconnectIdle.set(message.guild.id, { 
                message: message, 
                disconnectTimer: undefined,
                voiceConnection: voiceConnection
            });
        }
    },
    //this is the samething above but inside of an export so it can be called from commands/stop.js
    async disconnectTimervcidle(serverQueue, queue, DisconnectIdle, serverDisconnectIdle){
        serverDisconnectIdle.disconnectTimer = setTimeout(disconnectvcidle, 1800000, queue, DisconnectIdle, serverDisconnectIdle, serverQueue)
        console.log('Starting disconnectTimer Timeout');
    },
}
