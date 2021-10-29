//executive file holds all the executive functions and is the largest file
const ytSearch = require('yt-search');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const {AudioPlayerStatus,
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
var added = false;
var _playlist = false;
const noMoreSongsEmbed = new MessageEmbed()
    .setColor('RED')
    .setDescription(`:x: No More Songs To Play`)
;

function durationCheck(videoURL){
    let totalseconds = parseInt(videoURL.videoDetails.lengthSeconds);
    let minutes = Math.floor(totalseconds / 60);
    let Seconds = Math.abs(minutes * 60 - totalseconds);
    let seconds = undefined;
    if(Seconds < 10){
        seconds = `0${Seconds}`;
    }
    else{
        seconds = `${Seconds}`;
    }
    hours = Math.floor(totalseconds / 3600);
    if(hours > 0){
        for(i = 0;
            minutes > 60;
            i++){
                minutes = Math.floor(minutes - 60);
            }
        if(minutes < 10){
            minutes = `0${minutes}`
        }
        if(minutes === 60){
            return `${hours}:00:${seconds}`
        }
        else{
            return `${hours}:${minutes}:${seconds}`
        }
    }
    else{
        return `${minutes}:${seconds}`
    }
}

async function retryTimer(serverQueue){
    if(serverQueue.player.state.status !== AudioPlayerStatus.Playing && serverQueue.tries < 5 && serverQueue.loop === false){
        serverQueue.currentsong.shift();
        await findvideo(serverQueue);
        await play(serverQueue);
        console.log(`Retrying ${serverQueue.currentsong[0].title} at ${serverQueue.currentsong[0].url}`);
        if(serverQueue.tries > 2){
            serverQueue.message.channel.send(`Smoothy Is Buffering Please Wait`)
        }
    }else{
        serverQueue.currentsong.shift();
        await loopNextSong(serverQueue);
        console.log(`Retrying ${serverQueue.currentsong[0].title} at ${serverQueue.currentsong[0].url}`);
        if(serverQueue.tries > 2){
            serverQueue.message.channel.send(`Smoothy Is Buffering Please Wait`)
        }
    } 
}

async function checkIfPlaying(serverQueue){
    if(serverQueue.player.state.status === AudioPlayerStatus.Playing){
        return true;
    }
    else{
        return false;
    }
}

//disconnects from voiceConnection after 1800000 ms or 30 min
function disconnectvcidle(serverQueue, queue, DisconnectIdle, serverDisconnectIdle){
    serverDisconnectIdle.voiceConnection.disconnect();
    if(serverQueue !== undefined){
        queue.delete(serverQueue.message.guild.id);
    }
    DisconnectIdle.delete(serverDisconnectIdle.message.guild.id);
    const vcIdleEmbed = new MessageEmbed()
        .setColor('RED')
        .setDescription(':cry: Left VC Due To Idle')
    serverDisconnectIdle.message.channel.send({embeds: [vcIdleEmbed]});
    console.log(`Left VC Due To Idle`)
}

//starts the timer for 1800000 ms or 30 min which disconnects from voiceConnection
// this timer only starts when the audioPlayer is Idle 
function disconnectTimervcidle(serverQueue, queue, DisconnectIdle, serverDisconnectIdle){
    serverDisconnectIdle.disconnectTimer = setTimeout(disconnectvcidle, 1800000, serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
    console.log('Starting disconnectTimer Timeout');
}

async function createServerQueue(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue){
    duration = durationCheck(videoURL);
    songobject = {
        video: video,
        videoURL: videoURL,
        url: videoURL.videoDetails.embed.flashSecureUrl,
        title: videoURL.videoDetails.title,
        thumbnail: videoURL.videoDetails.thumbnails[3].url,
        message: message,
        args: args,
        duration: duration,
        messagesent: false,
        playlistsong: false,
    };
    currentsongobject = {
        video: video,
        videoURL: videoURL,
        title: videoURL.videoDetails.title,
        url: videoURL.videoDetails.embed.flashSecureUrl,
        thumbnail: videoURL.videoDetails.thumbnails[3].url,
        duration: duration,
        messagesent: false,
    }
    const player = createAudioPlayer();
    console.log('created the audioplayer');
    const subscription = voiceConnection.subscribe(player);
    console.log('subscribed to Player'); 
    if(_playlist === true){
        player.pause();
        console.log('Paused the player due to playlist being true')
    } 
    construct = {
        message: message,
        voiceChannel: message.member.voice.channel,
        voiceConnection: voiceConnection,
        songs: [songobject],
        shuffledSongs: [],
        currentsong: [currentsongobject],
        jump: 0,
        tries: 0,
        audioPlayerErr: false,
        player: player,
        subscription: subscription,
        currenttitle: undefined,
        shuffle: false,
        loop: false,
        loopsong: false,
        repeat: false,
        playlist: _playlist,
    };
    _playlist = false;
    
    //this function executes when the player throws an error
    construct.player.on('error',async (err) => {
        const localServerQueue = err.resource.metadata;
        localServerQueue.audioPlayerErr = true;
        console.log(`Audio Player Threw An Err`);
        const playing = await checkIfPlaying(localServerQueue);
        if(localServerQueue.tries <= 5 && playing === false){
            await retryTimer(localServerQueue);
            localServerQueue.tries = localServerQueue.tries + 1;
        }
        else{
            localServerQueue.tries = 0;
            localServerQueue.audioPlayerErr = false;
            console.log(`Retries Failed Sending Error Message`)
            const audioPlayerErrME = new MessageEmbed()
                .setColor('RED')
                .setTitle(`AudioPlayerError: [${localServerQueue.currentsong[0].title}](${localServerQueue.currentsong[0].url}) Threw An Error :pensive:`)
                .setDescription(`Please Screenshot this message along with any other relevent info, 
                and DM it to <@Eugene#3399> if you have a GitHub Profile I would appreciate a comment on
                the AudioPlayerError issue at [Smoothies Repo](https://github.com/y0Phoenix/Smoothy/issues/1).`)
                .setThumbnail(`https://github.com/y0Phoenix/Smoothy/blob/main/Smoothy%20Logo.png?raw=true`)
                .setImage(`${localServerQueue.currentsong[0].thumbnail}`)
                .setTimestamp();
            message.channel.send({embeds: [audioPlayerErrME]})
        }
    })

    //when the audioPlayer for this construct inside serverQueue is Idle the function is executed
    construct.player.on(AudioPlayerStatus.Idle, async (playerEvent) =>{
        //resource.metadata is set inside of the async play function 
        const localServerQueue = playerEvent.resource.metadata;
        console.log('Player Status Is Idle');
        if(localServerQueue.stop === true){

        }else{
            if(localServerQueue.player.state.status === AudioPlayerStatus.Idle && localServerQueue.audioPlayerErr === false){             
                //normal song ending when loop and loopsong are false
                if(localServerQueue.currentsong.length > 0){
                    localServerQueue.currentsong.shift();
                }
                    if(localServerQueue.loop === false && localServerQueue.loopsong === false && 
                        localServerQueue.shuffle === false && localServerQueue.jump === 0
                        && localServerQueue.repeat === false){
                        localServerQueue.songs.shift();
                        if(localServerQueue.songs.length > 0) {
                            playNext(localServerQueue, queue);
                        }
                        else {
                            localServerQueue.message.channel.send({embeds: [noMoreSongsEmbed]});
                            serverDisconnectIdle = DisconnectIdle.get(localServerQueue.message.guild.id);
                            queue.delete(localServerQueue.message.guild.id);
                            disconnectTimervcidle(localServerQueue, queue, DisconnectIdle, serverDisconnectIdle);
                        }
                    }
                    //song ending while loop is true and loopsong is false
                    else if(localServerQueue.loop === true && localServerQueue.loopsong === false && 
                        localServerQueue.shuffle === false && localServerQueue.jump === 0
                        && localServerQueue.repeat === false){
                        loopNextSong(localServerQueue);
                        console.log('Playing Next Song In Looped Queue');
                    }
                    //song ending whil loopsong is true
                    else if(localServerQueue.loopsong === true){
                            console.log('Playing Looped Current Song');
                            playNext(localServerQueue, queue);
                    }
                    //song ending while repeat is true
                    else if(localServerQueue.repeat === true){
                        playNext(localServerQueue, queue);
                        localServerQueue.repeat = false;
                    }
                    //song ending while jump > 0
                    else if(localServerQueue.jump > 0){
                        playNext(localServerQueue, queue);
                    }
                    //song ending while shuffle is true
                    else{
                        if(localServerQueue.shuffle === true && localServerQueue.loop === true 
                            && localServerQueue.loopsong === false && localServerQueue.jump === 0
                            && localServerQueue.repeat === false){
                            loopNextSong(localServerQueue)
                        }
                        else{
                            localServerQueue.shuffledSongs.shift();
                            if(localServerQueue.shuffledSongs.length > 0){
                                playNext(localServerQueue, queue)
                            }
                            else{
                                localServerQueue.message.channel.send({embeds: [noMoreSongsEmbed]});
                                serverDisconnectIdle = DisconnectIdle.get(localServerQueue.message.guild.id);
                                queue.delete(localServerQueue.message.guild.id);
                                disconnectTimervcidle(localServerQueue, queue, DisconnectIdle, serverDisconnectIdle);
                            }
                        }
                    }
            }else{

            }
        }
    })
    construct.player.on(AudioPlayerStatus.Playing, async (data) => {
        const localServerQueue = data.resource.metadata;
        if(localServerQueue.audioPlayerErr === true && localServerQueue.tries > 0){
            console.log('Retries Successfull')
            localServerQueue.audioPlayerErr = false;
            localServerQueue.tries = 0; 
            if(localServerQueue.shuffle === true){
                localServerQueue.currenttitle = localServerQueue.shuffledSongs[0].title;
                if(localServerQueue.loopsong === false && localServerQueue.audioPlayerErr === false && localServerQueue.songs[0].messagesent === false){
                    const playembed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(`:thumbsup: Now Playing`)
                        .setDescription(`:musical_note: ***[${localServerQueue.currenttitle}](${localServerQueue.shuffledSongs[0].url})*** :musical_note:`)
                        .addField(`Requested By` , `<@${localServerQueue.shuffledSongs[0].message.author.id}>`)
                        .setThumbnail(`${localServerQueue.shuffledSongs[0].thumbnail}`)
                        .setTimestamp()
                    ;
                    localServerQueue.message.channel.send({embeds: [playembed]});
                    localServerQueue.shuffledSongs[0].messagesent = true;
                }
            }
            else{
                localServerQueue.currenttitle = localServerQueue.currentsong[0].title;
                if(localServerQueue.loopsong === false && localServerQueue.audioPlayerErr === false && localServerQueue.songs[0].messagesent === false){
                    const playembed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(`:thumbsup: Now Playing`)
                        .setDescription(`:musical_note: ***[${localServerQueue.currenttitle}](${localServerQueue.currentsong[0].url})***`)
                        .addField(`Requested By` , `<@${localServerQueue.songs[0].message.author.id}>`)
                        .setThumbnail(`${localServerQueue.currentsong[0].thumbnail}`)
                        .setTimestamp()
                    ;
                    serverQueue.message.channel.send({embeds: [playembed]});
                    serverQueue.songs[0].messagesent = true;
                }
            }   
        }
    })
    queue.set(message.guild.id, construct);
}

//creates the serverQueue which stores info about the songs, voiceConnection, audioPlayer, subscription, and textChannel
async function executive(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue){
    serverDisconnectIdle = DisconnectIdle.get(message.guild.id)
    if(serverDisconnectIdle.disconnectTimer !== undefined){
        clearTimeout(serverDisconnectIdle.disconnectTimer);
        console.log('Cleared Timout For disconnectTimer');
    }    
    //checks if a serverQueue exists if it doesn't it creates the queue, else the song is pushed into serverQueue.songs
    duration = durationCheck(videoURL);
    if(!serverQueue){
        createServerQueue(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue);
        serverQueue = queue.get(message.guild.id);
        play(serverQueue);
    }
    else{
        serverQueue.songs.push({video: video, videoURL: videoURL, url: videoURL.videoDetails.embed.flashSecureUrl, 
            title: videoURL.videoDetails.title, thumbnail: videoURL.videoDetails.thumbnails[3].url,
            message: message, args: args, duration: duration, messagesent: false,});
        
        const addQueueEmbed = new MessageEmbed()
            .setColor('YELLOW')
            .setTitle(':thumbsup: Song Added To Queue')
            .setDescription(`***[${videoURL.videoDetails.title}](${videoURL.videoDetails.embed.flashSecureUrl})***
            Has Been Added To The Queue :arrow_down:`)
            .addFields(
                {
                    name: `Requested By` , value: `<@${message.author.id}>`, inline: true,
                },
                {
                    name: `***Duration***`, value: `${duration}`, inline: true
                })
            .setThumbnail(`${videoURL.videoDetails.thumbnails[3].url}`)
            .setTimestamp()
        message.channel.send({embeds: [addQueueEmbed]});
    }
}

//created the stream using ytdl-core, connects it to an audioResource then plays the resource inside of serverQueue.player
async function play(serverQueue) {
    if(serverQueue.playlist === true){
        serverQueue.player.unpause();
        console.log('Unpaused the player and set serverQueue.playlist to false')
        serverQueue.playlist = false;
    }
    if(serverQueue.shuffle === true){
        yturl = ytdl.validateURL(serverQueue.shuffledSongs[0].videoURL.videoDetails.embed.flashSecureUrl) ? true : false;
    }
    else{
        yturl = ytdl.validateURL(serverQueue.currentsong[0].videoURL.videoDetails.embed.flashSecureUrl) ? true : false;
    }
        if(yturl === true){
            try{
                if(serverQueue.shuffle === true){
                    if(serverQueue.jump > 0){
                        const stream = ytdl(serverQueue.shuffledSongs[0].url,{ 
                            highWaterMark: 33554, 
                            filter: 'audioonly', 
                            quality: 'highestaudio',
                        });
                        const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
                        resource.metadata = serverQueue;
                        serverQueue.player.play(resource);
                        console.log("Playing " + serverQueue.shuffledSongs[0].title + "!");
                        serverQueue.currenttitle = serverQueue.shuffledSongs[0].title;
                        if(serverQueue.loopsong === false && serverQueue.audioPlayerErr === false){
                            const playembed = new MessageEmbed()
                                .setColor('#0099ff')
                                .setTitle(`:thumbsup: Now Playing`)
                                .setDescription(`:musical_note: ***[${serverQueue.currenttitle}](${serverQueue.shuffledSongs[0].url})*** :musical_note:`)
                                .addFields(
                                    {
                                        name: `Requested By` , value: `<@${serverQueue.shuffledSongs[serverQueue.jump].message.author.id}>`, inline: true,
                                    },
                                    {
                                        name: `***Duration***`, value: `${serverQueue.currentsong[0].duration}`, inline: true
                                    })
                                .setThumbnail(`${serverQueue.shuffledSongs[0].thumbnail}`)
                                .setTimestamp()
                            ;
                            serverQueue.songs[0].message.channel.send({embeds: [playembed]});
                            serverQueue.shuffledSongs[0].messagesent = true;
                        }
                    }
                    if(serverQueue.shuffle === true && serverQueue.jump === 0){
                        const stream = ytdl(serverQueue.shuffledSongs[0].url,{ 
                            highWaterMark: 33554, 
                            filter: 'audioonly', 
                            quality: 'highestaudio',
                        });
                        const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
                        resource.metadata = serverQueue;
                        serverQueue.player.play(resource);
                        console.log("Playing " + serverQueue.shuffledSongs[0].title + "!");
                        serverQueue.currenttitle = serverQueue.shuffledSongs[0].title;
                        if(serverQueue.loopsong === false && serverQueue.audioPlayerErr === false){
                            const playembed = new MessageEmbed()
                                .setColor('#0099ff')
                                .setTitle(`:thumbsup: Now Playing`)
                                .setDescription(`:musical_note: ***[${serverQueue.currenttitle}](${serverQueue.shuffledSongs[0].url})*** :musical_note:`)
                                .addFields(
                                    {
                                        name: `Requested By` , value: `<@${serverQueue.shuffledSongs[0].message.author.id}>`, inline: true,
                                    },
                                    {
                                        name: `***Duration***`, value: `${serverQueue.currentsong[0].duration}`, inline: true
                                    })
                                .setThumbnail(`${serverQueue.shuffledSongs[0].thumbnail}`)
                                .setTimestamp()
                            ;
                            serverQueue.songs[0].message.channel.send({embeds: [playembed]});
                            serverQueue.shuffledSongs[0].messagesent = true;
                        }
                    }   
                }
                else if(serverQueue.jump > 0){
                    const stream = ytdl(serverQueue.currentsong[0].url,{ 
                        highWaterMark: 33554, 
                        filter: 'audioonly', 
                        quality: 'highestaudio',
                        }); 
                    const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
                    resource.metadata = serverQueue;
                    serverQueue.player.play(resource);
                    console.log("Playing " + serverQueue.currentsong[0].title + "!");
                    serverQueue.currenttitle = serverQueue.currentsong[0].title;
                    serverQueue.jump = 0;
                    if(serverQueue.loopsong === false && serverQueue.audioPlayerErr === false){
                        const playembed = new MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle(`:thumbsup: Now Playing`)
                            .setDescription(`:musical_note: ***[${serverQueue.currenttitle}](${serverQueue.currentsong[0].url})***`)
                            .addFields(
                                {
                                    name: `Requested By` , value: `<@${serverQueue.songs[0].message.author.id}>`, inline: true,
                                },
                                {
                                    name: `***Duration***`, value: `${serverQueue.currentsong[0].duration}`, inline: true
                                })
                            .setThumbnail(`${serverQueue.currentsong[0].thumbnail}`)
                            .setTimestamp()
                        ;
                        serverQueue.songs[0].message.channel.send({embeds: [playembed]});
                        serverQueue.songs[0].messagesent = true;
                    }
                }
                else{
                    const stream = ytdl(serverQueue.currentsong[0].url,{ 
                        highWaterMark: 33554, 
                        filter: 'audioonly', 
                        quality: 'highestaudio',
                        }); 
                    const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
                    resource.metadata = serverQueue;
                    serverQueue.player.play(resource);
                    console.log("Playing " + serverQueue.currentsong[0].title + "!");
                    serverQueue.currenttitle = serverQueue.currentsong[0].title;
                    if(serverQueue.loopsong === false && serverQueue.audioPlayerErr === false){
                        const playembed = new MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle(`:thumbsup: Now Playing`)
                            .setDescription(`:musical_note: ***[${serverQueue.currenttitle}](${serverQueue.currentsong[0].url})***`)
                            .addFields(
                                {
                                    name: `Requested By` , value: `<@${serverQueue.songs[0].message.author.id}>`, inline: true,
                                },
                                {
                                    name: `***Duration***`, value: `${serverQueue.currentsong[0].duration}`, inline: true
                                })
                            .setThumbnail(`${serverQueue.currentsong[0].thumbnail}`)
                            .setTimestamp()
                        ;
                        serverQueue.songs[0].message.channel.send({embeds: [playembed]});
                        serverQueue.songs[0].messagesent = true;
                    }
                }   
            }catch (err) {
                console.log(err)
            }
        }
        else{
            serverQueue.message.channel.send(`***${serverQueue.songs[0].title}*** Was Not Valid`)
            serverQueue.player.stop();
        }
}

//searches for the song again to ensure it exists then plays that song at the play function
async function playNext(serverQueue){
    await findvideo(serverQueue)    
    play(serverQueue); 
}

//finds the song again to ensure it exists then sets a constant to the song in front of the queue and pushes that song to the back, which makes a looped song queue
async function loopNextSong(serverQueue){
    await findvideo(serverQueue)
    if(serverQueue.shuffle === true){
        const currentsong = serverQueue.shuffledSongs[0];
        serverQueue.shuffledSongs.shift();
        serverQueue.shuffledSongs.push(currentsong);
        play(serverQueue)
    }
    else{
        const currentsong = serverQueue.songs[0];
        serverQueue.songs.shift();
        serverQueue.songs.push(currentsong);
        play(serverQueue)
    }
}

//finds the song specified in args
async function findvideo(serverQueue){
    if(serverQueue.shuffle === true && serverQueue.loop === true && serverQueue.loopsong === false){
        if(serverQueue.shuffledSongs[1].playlistsong === true){
            videoName = serverQueue.shuffledSongs[1].title;
            serverQueue.playlist = true
        }
        else{
            videoName = serverQueue.shuffledSongs[1].args.join(' ');  
        }  
    }
    else if(serverQueue.shuffle === true && serverQueue.loop === false && serverQueue.loopsong === true){
        if(serverQueue.shuffledSongs[0].playlistsong === true){
            videoName = serverQueue.shuffledSongs[0].title;
            serverQueue.playlist = true
        }
        else{
            videoName = serverQueue.shuffledSongs[0].args.join(' ');  
        }  
    }
    else if(serverQueue.shuffle === true && serverQueue.loop === false && serverQueue.loopsong === false){
        if(serverQueue.shuffledSongs[0].playlistsong === true){
            videoName = serverQueue.shuffledSongs[0].title;
            serverQueue.playlist = true
        }
        else{
            videoName = serverQueue.shuffledSongs[0].args.join(' ');  
        }  
    }
    else if(serverQueue.loop === true && serverQueue.shuffle === false && serverQueue.songs.length > 1){
        if(serverQueue.songs[0].playlistsong === true){
            videoName = serverQueue.songs[0].title;
            serverQueue.playlist = true
        }
        else{
            videoName = serverQueue.songs[0].args.join(' ');  
        }  
    }
    else if(serverQueue.jump > 0){
        if(serverQueue.shuffle === true){
            var i = serverQueue.jump;
            if(serverQueue.shuffledSongs[i].playlistsong === true){
                videoName = serverQueue.shuffledSongs[i].title;
                serverQueue.shuffledSongs.splice(i, 1)
                serverQueue.playlist = true
            }
            else{
                videoName = serverQueue.shuffledSongs[i].args.join(' ');
                serverQueue.shuffledSongs.splice(i, 1)  
            }
        }else{
            var i = serverQueue.jump;
            if(serverQueue.songs[i].playlistsong === true){
                videoName = serverQueue.songs[i].title;
                serverQueue.songs.splice(i, 1)
                serverQueue.playlist = true

            }
            else{
                videoName = serverQueue.songs[i].args.join(' ');
                serverQueue.songs.splice(i, 1)  
            }
        }  
    }
    else{
        if(serverQueue.songs[0].playlistsong === true){
            videoName = serverQueue.songs[0].title;
            serverQueue.playlist = true
        }
        else{
            videoName = serverQueue.songs[0].args.join(' ');  
        }  
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
    console.log(`Found ${videoURL.videoDetails.title}`)
    duration = durationCheck(videoURL);
    serverQueue.currentsong.push({video: video, videoURL: videoURL, title: videoURL.videoDetails.title,
        url: videoURL.videoDetails.embed.flashSecureUrl, thumbnail: videoURL.videoDetails.thumbnails[3].url, 
        duration: duration, messagesent: false,})      
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
                executive(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue);
            }
        }
        else{
            videoURL = await ytdl.getInfo(videoName);
            if(videoURL){
                yturl = ytdl.validateURL(videoURL.videoDetails.embed.flashSecureUrl) ? true : false;
                if (yturl === true){
                    executive(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue);
                }
            else{
                message.channel.send(':rofl: No ***video*** results found :rofl:');
                return;
                }
            }
        }   
    },
    async findvideoplaylist(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue){
        _playlist = true;
        videoName = args.join(' ');
        const playlist = await ytpl(videoName);
        if(playlist){
            const playlistEmbed = new MessageEmbed()
                .setColor('GOLD')
                .setTitle(`Found YouTube Playlist`)
                .setDescription(`:notes: ***[${playlist.title}](${playlist.url})***
                All The Songs Will Be Added To The Queue!`)
                .addFields(
                    {
                        name: 'Requested By',value: `<@${message.author.id}>`,inline: true
                    },
                    {
                        name: 'Song Count',value: `**${playlist.estimatedItemCount}**`
                    }
                )
                .setThumbnail(`${playlist.bestThumbnail.url}`)
                .setTimestamp()
            ;
            message.channel.send({embeds: [playlistEmbed]});
            console.log('Found YouTube playlist');
            if(!serverQueue){
                videoName = playlist.items[0].title;
                const videoFinder = async (query) => {
                    const videoResult = await ytSearch(query);
                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
                }
                video = await videoFinder(videoName);
                videoURL = await ytdl.getBasicInfo(video.url)
                duration = playlist.items[0].duration;
                await createServerQueue(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue,);
                serverQueue = queue.get(message.guild.id);
                serverQueue.playlist = true;
                console.log('Created the serverQueue');
                added = true;
            }
            for(i=0;
                i < playlist.items.length;
                i++){
                if(added === true){
                    added = false;
                }
                else{
                    duration = playlist.items[i].duration;
                    serverQueue.songs.push({video: undefined, videoURL: undefined, url: playlist.items[i].url, 
                        title: playlist.items[i].title, thumbnail: playlist.items[i].bestThumbnail.url,
                        message: message, args: args, duration: duration, messagesent: false, playlistsong: true,});
                }   
            }
            play(serverQueue);   
        }
        else{
            const noPlaylistEmbed = new MessageEmbed()
                .setColor('RED')
                .setDescription(':rofl: Playlist Either Doesnt Exist Or Is Private')
            ;
            message.channel.send({embeds: [noPlaylistEmbed]});
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
