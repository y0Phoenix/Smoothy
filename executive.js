//executive file holds all the executive functions and is the largest file
const ytSearch = require('yt-search');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const {deleteMsg, leave, distance, topResult, find, writeGlobal, exists } = require('./modules');
const {
  AudioPlayerStatus,
  StreamType,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnectionStatus,
} = require('@discordjs/voice');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const playdl = require('play-dl');
var voiceConnection;
var video;
var videoURL;
var yturl;
var videoName;

const videoFinder = async (query) => {
  const videoResult = await ytSearch(query);
  if (videoResult.videos) {
    let name = query.toLowerCase();
    let _possibleVids = [];
    let vid = videoResult.videos[0].title.toLowerCase();
    let includes = vid.includes(name);
    if (includes === true) {
      return videoResult.videos[0];
    } else {
      for (i = 0; i < 6; i++) {
        let possibleVid = videoResult.videos[i].title.toLowerCase();
        let dif = distance(name, possibleVid);
        _possibleVids.push({ dif: dif, video: videoResult.videos[i] });
      }
      const returnObj = await topResult(_possibleVids); 
      return returnObj.video;
    }
  }
  return undefined;
};

const noMoreSongsEmbed = new MessageEmbed()
  .setColor('RED')
  .setDescription(`:x: No More Songs To Play`);
const noVidEmbed = new MessageEmbed()
  .setColor('RED')
  .setDescription(':rofl: No ***video*** results found');
function validURL(videoName) {
  var pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ); // fragment locator
  return !!pattern.test(videoName);
}

function durationCheck(dur) {
  let totalseconds = parseInt(dur);
  let minutes = Math.floor(totalseconds / 60);
  let Seconds = Math.abs(minutes * 60 - totalseconds);
  let _seconds;
  if (Seconds < 10) {
    _seconds = `0${Seconds}`;
  } else {
    _seconds = `${Seconds}`;
  }
  hours = Math.floor(totalseconds / 3600);
  if (hours > 0) {
    for (i = 0; minutes > 60; i++) {
      minutes = Math.floor(minutes - 60);
    }
    if (minutes < 10) {
      minutes = `0${minutes}`;
    }
    if (minutes === 60) {
      return `${hours}:00:${_seconds}`;
    } else {
      return `${hours}:${minutes}:${_seconds}`;
    }
  } else {
    return `${minutes}:${_seconds}`;
  }
}

async function retryTimer(
  serverQueue,
  queue,
  DisconnectIdle,
  serverDisconnectIdle
) {
  if (serverQueue.player.state.status !== AudioPlayerStatus.Playing && serverQueue.tries < 5 && serverQueue.loop === false) {
    if (serverQueue.jump === true) {
      const result = await find(serverQueue, serverQueue.currentsong[0].title);
      if (result !== null) {
        if (result.shuffledSong !== null) {
          serverQueue.jump = result.shuffledSong;
        }
        else {
          serverQueue.jump = result.song;
        }
      }

      else {
        const errorEmbed = new MessageEmbed()
          .setColor('RED')
          .setDescription(`:thumbsdown: [${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url}) failed to play reverting to original queue try again later`)
        ;
        let msg = await serverQueue.message.channel.send({embeds: [errorEmbed]});
        deleteMsg(msg, 30000, false);
      }
    }
    serverQueue.currentsong.shift();
    await findvideo(serverQueue);
    console.log(
      `Retrying ${serverQueue.currentsong[0].title} at ${serverQueue.currentsong[0].url}`
    );
    play(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
    if (serverQueue.tries >= 4) {
      serverQueue.message.channel
        .send(`Smoothy Is Buffering Please Wait`)
        .then((msg) => deleteMsg(msg, 30000, false));
    }
  }
}

async function checkIfPlaying(serverQueue) {
  if (serverQueue.player.state.status === AudioPlayerStatus.Playing) {
    return true;
  } else {
    return false;
  }
}

async function audioPlayerIdle(
  serverQueue,
  queue,
  DisconnectIdle,
  serverDisconnectIdle
) {
  console.log('Player Status Is Idle');
  if (serverQueue.stop === true) {
  } else {
    if (serverQueue.player.state.status === AudioPlayerStatus.Idle && !serverQueue.audioPlayerErr) {
      serverQueue.messagesent = false;
      if (serverQueue.nowPlaying) {
        await serverQueue.nowPlaying.delete();
        serverQueue.nowPlaying = undefined;
      }
      if (serverQueue.jump === true) {
        serverQueue.jump = 0;
      }
      // song ending while previous is true
      if (serverQueue.previousbool) {
        playNext(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
        serverQueue.currentsong.shift();
        serverQueue.bool = true;
      }
      else {
        serverQueue.previous.shift();
        serverQueue.previous.push(serverQueue.currentsong[0]);
        //normal song ending
        if (!serverQueue.loop && !serverQueue.loopsong && !serverQueue.shuffle && serverQueue.jump === 0 && !serverQueue.repeat) {
          serverQueue.bool ? serverQueue.bool = false : serverQueue.songs.shift();
          if (serverQueue.songs.length > 0) {
            playNext(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
          } else {
            serverQueue.message.channel
              .send({ embeds: [noMoreSongsEmbed] })
              .then((msg) => deleteMsg(msg, 30000, false)); 
            serverDisconnectIdle = DisconnectIdle.get(
              serverQueue.message.guildId
            );
            queue.delete(serverQueue.message.guildId);
            await writeGlobal('delete queue', null, serverQueue.id);
            writeGlobal('delete dci', null, serverQueue.id);
            disconnectTimervcidle(queue, DisconnectIdle, serverDisconnectIdle);
          }
        }
        //song ending while loop is true and loopsong is false
        else if (serverQueue.loop === true && serverQueue.loopsong === false && serverQueue.shuffle === false && serverQueue.jump === 0 && 
          serverQueue.repeat === false && serverQueue.previousbool === false) {
          loopNextSong(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
          console.log('Playing Next Song In Looped Queue');
        }
        //song ending whil loopsong is true
        else if (serverQueue.loopsong === true) {
          console.log('Playing Looped Current Song');
          playNext(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
        }
        //song ending while repeat is true
        else if (serverQueue.repeat === true) {
          playNext(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
        }
        //song ending while jump > 0
        else if (serverQueue.jump > 0) {
          playNext(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
        }
        //song ending while shuffle is true
        else {
          if (serverQueue.shuffle === true && serverQueue.loop === true && serverQueue.loopsong === false
             && serverQueue.jump === 0 && serverQueue.repeat === false && serverQueue.previousbool === false) {
            loopNextSong(
              serverQueue,
              queue,
              DisconnectIdle,
              serverDisconnectIdle
            );
          } else {
            const currentsong = serverQueue.shuffledSongs[0];
            findSplice(serverQueue, currentsong);
            serverQueue.shuffledSongs.shift();
            if (serverQueue.shuffledSongs.length > 0) {
              playNext(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
            } else {
              serverQueue.message.channel
                .send({ embeds: [noMoreSongsEmbed] })
                .then((msg) => deleteMsg(msg, 30000, false));
              serverDisconnectIdle = DisconnectIdle.get(
                serverQueue.message.guildId
              );
              queue.delete(serverQueue.message.guildId);
              writeGlobal('delete queue', null, serverQueue.id);
              disconnectTimervcidle(queue, DisconnectIdle, serverDisconnectIdle);
            }
          }
        }
      }
    } else {
    }
  }
}

//disconnects from voiceConnection after 1800000 ms or 30 min
function disconnectvcidle(queue, DisconnectIdle, serverDisconnectIdle) {
  const vcIdleEmbed = new MessageEmbed()
    .setColor('RED')
    .setDescription(':cry: Left VC Due To Idle');
  serverDisconnectIdle.message.channel
    .send({ embeds: [vcIdleEmbed] })
    .then((msg) => deleteMsg(msg, 60000, false));
  console.log(`Left VC Due To Idle`);
  leave(queue, DisconnectIdle, serverDisconnectIdle.message);
}

//starts the timer for 1800000 ms or 30 min which disconnects from voiceConnection
// this timer only starts when the audioPlayer is Idle
function disconnectTimervcidle(queue, DisconnectIdle, serverDisconnectIdle) {
  serverDisconnectIdle.disconnectTimer = setTimeout(
    disconnectvcidle,
    1800000,
    queue,
    DisconnectIdle,
    serverDisconnectIdle
  );
  console.log('Starting disconnectTimer Timeout');
}

async function createServerQueue(
  message,
  args,
  queue,
  DisconnectIdle,
  serverDisconnectIdle,
  serverQueue,
) {
  const duration = durationCheck(videoURL.video_details.durationInSec);
  const durationS = parseInt(videoURL.video_details.durationInSec);
  songobject = {
    video: video,
    videoURL: videoURL,
    url: videoURL.video_details.url,
    title: videoURL.video_details.title,
    thumbnail: videoURL.video_details.thumbnails[3].url,
    message: message,
    args: args,
    duration: duration,
    durationS: durationS,
    playlistsong: false,
  };
  currentsongobject = {
    video: video,
    videoURL: videoURL,
    title: videoURL.video_details.title,
    url: videoURL.video_details.url,
    thumbnail: videoURL.video_details.thumbnails[3].url,
    message: message,
    duration: duration,
    durationS: durationS,
    load: false
  };
  const player = createAudioPlayer();
  console.log('created the audioplayer');
  const subscription = voiceConnection.subscribe(player);
  console.log('subscribed to Player');
  construct = {
    message: message,
    id: message.guildId,
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
    previous: [],
    previousbool: false,
    resource: undefined,
    messagesent: false,
    nowPlaying: undefined,
    nowPlayingTimer: undefined,
    shuffle: false,
    loop: false,
    loopsong: false,
    repeat: false,
    playlist: false,
    bool: false,
  };

  //this function executes when the player throws an error
  construct.player.on('error', async (err) => {
    const localServerQueue = err.resource.metadata;
    localServerQueue.audioPlayerErr = true;
    console.log(`Audio Player Threw An Err`);
    setTimeout(async () => {
      if (localServerQueue.tries < 5) {
        localServerQueue.player.stop();
        await retryTimer(
          localServerQueue,
          queue,
          DisconnectIdle,
          serverDisconnectIdle
        );
        localServerQueue.tries++;
        const playing = await checkIfPlaying(localServerQueue);
        if (playing === true) {
          localServerQueue.tries = 0;
          localServerQueue.audioPlayerErr = false;
          console.log('Retries Sucessfull');
        }
      } else if (localServerQueue.tries === 5) {
        localServerQueue.tries = 0;
        localServerQueue.audioPlayerErr = false;
        console.log(`Retries Failed Sending Error Message`);
        const audioPlayerErrME = new MessageEmbed()
          .setColor('RED')
          .setTitle(
            `AudioPlayerError: ${localServerQueue.songs[0].title} Threw An Error :pensive:`
          )
          .setURL(`${localServerQueue.songs[0].url}`)
          .setDescription(
            `Please Screenshot this message along with any other relevent info, 
                    and DM it to **Eugene#3399** if you have a GitHub Profile I would appreciate a comment on
                    the AudioPlayerError issue at [Smoothies Repo](https://github.com/y0Phoenix/Smoothy/issues/1).`
          )
          .setThumbnail(
            `https://github.com/y0Phoenix/Smoothy/blob/main/Smoothy%20Logo.png?raw=true`
          )
          .setImage(`${localServerQueue.songs[0].thumbnail}`)
          .setTimestamp();
        message.channel.send({ embeds: [audioPlayerErrME] });
        localServerQueue.player.stop();
        audioPlayerIdle(
          localServerQueue,
          queue,
          DisconnectIdle,
          serverDisconnectIdle
        );
      }
    }, 1500);
  });

  //when the audioPlayer for this construct inside serverQueue is Idle the function is executed
  construct.player.on(AudioPlayerStatus.Idle, async (playerEvent) => {
    //resource.metadata is set inside of the async play function
    const localServerQueue = playerEvent.resource.metadata;
    audioPlayerIdle(
      localServerQueue,
      queue,
      DisconnectIdle,
      serverDisconnectIdle
    );
  });
  construct.player.on(AudioPlayerStatus.Playing, async (data) => {
    const localServerQueue = data.resource.metadata;
    if (
      localServerQueue.audioPlayerErr === true &&
      localServerQueue.tries > 0
    ) {
      console.log('Retries Successfull');
      localServerQueue.audioPlayerErr = false;
      localServerQueue.tries = 0;
      if (
        localServerQueue.loopsong === false &&
        localServerQueue.audioPlayerErr === false &&
        localServerQueue.messagesent === false
      ) {
        const playembed = new MessageEmbed()
          .setColor('#0099ff')
          .setTitle(`:thumbsup: Now Playing`)
          .setDescription(
            `:musical_note: ***[${localServerQueue.currentsong[0].title}](${localServerQueue.currentsong[0].url})*** :musical_note:`
          )
          .addField(
            `Requested By`,
            `<@${localServerQueue.currentsong[0].message.author.id ? localServerQueue.currentsong[0].message.author.id : localServerQueue.currentsong[0].message.authorId}>`
          )
          .setThumbnail(`${localServerQueue.currentsong[0].thumbnail}`)
          .setTimestamp();
        localserverQueue.nowPlaying =
          await localServerQueue.message.channel.send({ embeds: [playembed] });
        deleteMsg(
          localServerQueue.nowPlaying,
          serverQueue.currentsong[0].durationms,
          true
        );
        localServerQueue.messagesent = true;
        writeGlobal('update queue', localServerQueue, localServerQueue.id)
      }
    }
  });
  const bool = await exists(message.guildId, 'queue');
  if (bool) {
    serverQueue = queue.get(message.guildId);
    serverQueue.player = construct.player;
    serverQueue.subscription = construct.subscription;
  }
  else {
    queue.set(message.guildId, construct);
    writeGlobal('add queue', queue.get(message.guildId), message.guildId);
  }
}

//creates the serverQueue which stores info about the songs, voiceConnection, audioPlayer, subscription, and textChannel
async function executive(
  message,
  args,
  queue,
  DisconnectIdle,
  serverDisconnectIdle,
  serverQueue
) {
  serverDisconnectIdle = DisconnectIdle.get(message.guildId);
  if (serverDisconnectIdle.disconnectTimer !== undefined) {
    clearTimeout(serverDisconnectIdle.disconnectTimer);
    console.log('Cleared Timout For disconnectTimer');
    writeGlobal('update dci', serverDisconnectIdle, message.guildId);
  }
  //checks if a serverQueue exists if it doesn't it creates the queue, else the song is pushed into serverQueue.songs
  duration = durationCheck(videoURL.video_details.durationInSec);
  let durationms = parseInt(videoURL.video_details.durationInSec) * 1000;
  const queuePush = async () => {
    let songObj = {
      video: video,
      videoURL: videoURL,
      url: videoURL.video_details.url,
      title: videoURL.video_details.title,
      thumbnail: videoURL.video_details.thumbnails[3].url,
      message: message,
      args: args,
      duration: duration,
      durationms: durationms,
      playlistsong: false,
    }
    serverQueue.songs.push(songObj);
    writeGlobal('update queue', serverQueue, serverQueue.id);
  
    const addQueueEmbed = new MessageEmbed().setColor('YELLOW')
      .setDescription(`***[${videoURL.video_details.title}](${videoURL.video_details.url})***
            Has Been Added To The Queue :arrow_down:`);
    let msg = await message.channel.send({ embeds: [addQueueEmbed] });
    serverDisconnectIdle.msgs.push(msg);
    writeGlobal('update dci', serverDisconnectIdle, serverDisconnectIdle.id);
  }
  if (!serverQueue) {
      await createServerQueue(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue);
      serverQueue = queue.get(message.guildId);
      play(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
  } else {
    if (!serverQueue.currentsong[0].load) {
      queuePush();
    }
    else {
      serverQueue.currentsong[0].load = false;
      await createServerQueue(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue);
      serverQueue = queue.get(message.guildId);
      play(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
    }
  }
}

//created the stream using ytdl-core, connects it to an audioResource then plays the resource inside of serverQueue.player
async function play(serverQueue, queue, DisconnectIdle, serverDisconnectIdle) {
  if (serverQueue.shuffle === true) {
    yturl = ytdl.validateURL(serverQueue.shuffledSongs[0].url) ? true : false;
  } else {
    yturl = ytdl.validateURL(serverQueue.currentsong[0].url) ? true : false;
  }
  if (yturl === true) {
    try {
      // todo fix ytdl-core v4.9.2 errors
      const stream = await playdl.stream(serverQueue.currentsong[0].url);
      serverQueue.resource = createAudioResource(stream.stream, {
        inputType: stream.type,
        inlineVolume: true,
      });
      serverQueue.resource.metadata = serverQueue;
      serverQueue.player.play(serverQueue.resource);
      console.log('Playing ' + serverQueue.currentsong[0].title + '!');
      if (serverQueue.audioPlayerErr === false) {
        const playembed = new MessageEmbed()
          .setColor('#0099ff')
          .setTitle(`:thumbsup: Now Playing`)
          .setDescription(
            `:musical_note: ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})***`
          )
          .addFields(
            {
              name: `Requested By`,
              value: `<@${!serverQueue.currentsong[0].message.authorId ? serverQueue.currentsong[0].message.author.id: serverQueue.currentsong[0].message.authorId}>`,
              inline: true,
            },
            {
              name: `***Duration***`,
              value: `${serverQueue.currentsong[0].duration}`,
              inline: true,
            }
          )
          .setThumbnail(`${serverQueue.currentsong[0].thumbnail}`);
        serverQueue.nowPlaying =
          await serverQueue.message.channel.send({
            embeds: [playembed],
          });
        serverQueue.messagesent = true;
        writeGlobal('update queue', serverQueue, serverQueue.id)
      }
      serverQueue.repeat = false;

    } catch (err) {
      console.log(err);
    }
  } else {
    serverQueue.message.channel
      .send({ embeds: [noVidEmbed] })
      .then((msg) => deleteMsg(msg, 30000, false));
    serverQueue.player.stop();
    audioPlayerIdle(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
  }
}

//searches for the song again to ensure it exists then plays that song at the play function
async function playNext(serverQueue, queue, DisconnectIdle, serverDisconnectIdle) {
  await findvideo(serverQueue);
  play(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
}

function findSplice(serverQueue, currentsong) {
  const title = currentsong.title;
  for (i = 0; i < serverQueue.songs.length; i++) {
    if (title === serverQueue.songs[i].title) {
      if (i === 0) {
        serverQueue.songs.shift();
      } else {
        console.log(`Splicing ${serverQueue.songs[i].title} ${i}`);
        serverQueue.songs.splice(i, 1);
      }
    }
  }
}

//finds the song again to ensure it exists then sets a constant to the song in front of the queue and pushes that song to the back, which makes a looped song queue
async function loopNextSong(
  serverQueue,
  queue,
  DisconnectIdle,
  serverDisconnectIdle
) {
  await findvideo(serverQueue);
  if (serverQueue.shuffle === true) {
    const currentsong = serverQueue.shuffledSongs[0];
    findSplice(serverQueue, currentsong);
    serverQueue.shuffledSongs.shift();
    serverQueue.shuffledSongs.push(currentsong);
    play(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
  } else {
    const currentsong = serverQueue.songs[0];
    serverQueue.songs.shift();
    serverQueue.songs.push(currentsong);
    play(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
  }
}

//finds the song specified in args
async function findvideo(serverQueue) {
  let message = undefined;
  if (serverQueue.previousbool) {
    videoName = serverQueue.previous[0].url;
    message = serverQueue.previous[0].message;
    serverQueue.previousbool = false;
  }
  else {
    if (serverQueue.loopsong === true) {
      videoName = serverQueue.currentsong[0].url;
      message = serverQueue.currentsong[0].message;
    }
    else if (
      serverQueue.shuffle === true &&
      serverQueue.loop === true
    ) {
      videoName = serverQueue.shuffledSongs[1].url;
      message = serverQueue.shuffledSongs[1].message;
    } else if (
      serverQueue.shuffle === true &&
      serverQueue.loop === false
    ) {
        videoName = serverQueue.shuffledSongs[0].url;
        message = serverQueue.shuffledSongs[0].message;
    } 
    else if (
      serverQueue.shuffle === true &&
      serverQueue.loop === false
    ) {
      let i = serverQueue.jump;
      serverQueue.jump = true;
      if (i > 0) {
          videoName = serverQueue.shuffledSongs[i].url;
          message = serverQueue.shuffledSongs[i].message;
          serverQueue.shuffledSongs.splice(i, 1);
          serverQueue.songs.splice(i, 1);
      }
      else {
          videoName = serverQueue.shuffledSongs[0].url;
          message = serverQueue.shuffledSongs[0].message;
      }
    } else if (
      serverQueue.loop === true &&
      serverQueue.shuffle === false &&
      serverQueue.songs.length > 1
    ) {
        videoName = serverQueue.songs[0].url;
        message = serverQueue.songs[0].message;
    } else if (serverQueue.jump > 0) {
        let i = serverQueue.jump;
        serverQueue.jump = true;
        videoName = serverQueue.songs[i].url;
        message = serverQueue.songs[i].message;
        serverQueue.songs.splice(i, 1);
    }
    else {
        videoName = serverQueue.songs[0].url;
        message = serverQueue.songs[0].message;
    }
  }
  let URL = validURL(videoName);
  if (URL === true) {
    videoURL = await playdl.video_info(videoName);
  } else {
    video = await videoFinder(videoName);
    if (video) {
      videoURL = await playdl.video_info(video.url);
    }
  }
  if (serverQueue.currentsong.length > 0) {
    serverQueue.currentsong.shift();
  }
  console.log(`Found ${videoURL.video_details.title}`);
  duration = durationCheck(videoURL.video_details.durationInSec);
  let durationS = parseInt(videoURL.video_details.durationInSec);
  const songObj = {
    video: video,
    videoURL: videoURL,
    title: videoURL.video_details.title,
    url: videoURL.video_details.url,
    thumbnail: videoURL.video_details.thumbnails[3].url,
    message: message,
    duration: duration,
    durationS: durationS,
    load: false,
  }
  serverQueue.currentsong.push(songObj);
  writeGlobal('update queue', serverQueue, message.guildId);
}

module.exports = {
  name: 'executive',
  description: 'executive functions',
  //this function only gets called from commands/play.js. It finds the song specified in args
  async FindVideoCheck(
    message,
    args,
    queue,
    DisconnectIdle,
    serverDisconnectIdle,
    serverQueue
  ) {
    if (Array.isArray(args)) {
      videoName = args.join(' ');
    }
    else {
      videoName = args;
    }
    let URL = validURL(videoName);
    if (URL === true) {
      videoURL = await playdl.video_info(videoName);
      if (videoURL) {
        console.log(`Found ${videoURL.video_details.title}`);
        yturl = ytdl.validateURL(videoURL.video_details.embed.flashSecureUrl)
          ? true
          : false;
        if (yturl === true) {
          executive(
            message,
            args,
            queue,
            DisconnectIdle,
            serverDisconnectIdle,
            serverQueue
          );
        } else {
          message.channel
            .send({ embeds: [noVidEmbed] })
            .then((msg) => deleteMsg(msg, 30000, false));
          return;
        }
      }
    } else {
      video = await videoFinder(videoName);
      if (video) {
        videoURL = await playdl.video_info(video.url);
        console.log(`Found ${videoURL.video_details.title}`);
        yturl = ytdl.validateURL(videoURL.video_details.url)
          ? true
          : false;
        if (yturl === true) {
          executive(
            message,
            args,
            queue,
            DisconnectIdle,
            serverDisconnectIdle,
            serverQueue
          );
        }
      } else {
        message.channel
          .send({ embeds: [noVidEmbed] })
          .then((msg) => deleteMsg(msg, 30000, false));
        return;
      }
    }
  },
  async findvideoplaylist(
    message,
    args,
    queue,
    DisconnectIdle,
    serverDisconnectIdle,
    serverQueue
  ) {
    serverDisconnectIdle = DisconnectIdle.get(message.guildId);
    if (serverDisconnectIdle.disconnectTimer !== undefined) {
      clearTimeout(serverDisconnectIdle.disconnectTimer);
      console.log('Cleared Timout For disconnectTimer');
    }
    videoName = args.join(' ');
    if (videoName.includes('/playlist')) {
      const playlist = await ytpl(videoName);
      var added = false;
      if (playlist) {
        videoURL = await playdl.video_info(playlist.items[0].shortUrl);
        const playlistEmbed = new MessageEmbed()
          .setColor('GOLD')
          .setTitle(`Found YouTube Playlist`)
          .setDescription(
            `:notes: ***[${playlist.title}](${playlist.url})***
                    All The Songs Will Be Added To The Queue!`
          )
          .addFields(
            {
              name: 'Requested By',
              value: `<@${message.author.id}>`,
              inline: true,
            },
            {
              name: 'Song Count',
              value: `**${playlist.estimatedItemCount}**`,
            }
          )
          .setThumbnail(`${playlist.bestThumbnail.url}`)
          .setTimestamp();
        console.log(`Found YouTube playlist ${playlist.title}`);
        if (!serverQueue) {
          duration = playlist.items[0].duration;
          await createServerQueue(
            message,
            args,
            queue,
            DisconnectIdle,
            serverDisconnectIdle,
            serverQueue,
            videoURL
          );
          serverQueue = queue.get(message.guildId);
          serverQueue.messagesent = true;
          serverQueue.playlist = true;
          console.log('Created the serverQueue');
          added = true;
          play(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
        }
        let msg = await message.channel.send({embeds: [playlistEmbed],});
        serverDisconnectIdle.msgs.push(msg);
        writeGlobal('update dci', serverDisconnectIdle, serverDisconnectIdle.id);
        for (i = 0; i < playlist.items.length; i++) {
          if (added === true) {
            added = false;
          } else {
            duration = playlist.items[i].duration;
            let songObj = {
                video: undefined,
                videoURL: undefined,
                url: playlist.items[i].shortUrl,
                title: playlist.items[i].title,
                thumbnail: playlist.items[i].bestThumbnail.url,
                message: message,
                args: args,
                duration: duration,
                playlistsong: true,
            }
            serverQueue.songs.push(songObj);
          }
        }
        writeGlobal('update queue', serverQueue, serverQueue.id);
      } else {
        const noPlaylistEmbed = new MessageEmbed()
          .setColor('RED')
          .setDescription(':rofl: Playlist Either Doesnt Exist Or Is Private');
        message.channel
          .send({ embeds: [noPlaylistEmbed] })
          .then((msg) => deleteMsg(msg, 30000, false));
      }
    } else {
      const wrongEmbed = new MessageEmbed()
        .setColor('RED')
        .setDescription(':rofl: You Need To Add A Valid Playlist Link');
      message.channel
        .send({ embeds: [wrongEmbed] })
        .then((msg) => deleteMsg(msg, 30000, false));
    }
  },
  //joins the voiceChannel only when voiceConnection is disconnected
  async joinvoicechannel(message, vc, DisconnectIdle, serverDisconnectIdle, client, bool) {
    if (VoiceConnectionStatus.Disconnected)
      voiceConnection = joinVoiceChannel({
        channelId: vc.id,
        guildId: vc.guildId,
        adapterCreator: vc.guild.voiceAdapterCreator,
      });
    //sets the DisconnectIdle map
    if (!serverDisconnectIdle) {
      if (bool) {
      }
      else {
        DisconnectIdle.set(message.guildId, {
          message: message,
          id: message.guildId,
          client: client,
          disconnectTimer: undefined,
          voiceConnection: voiceConnection,
          msgs: [],
          queueMsgs: [],
        });
        await writeGlobal('add dci', DisconnectIdle.get(message.guildId), message.guildId);
      }
    }
  },
  //this is the samething above but inside of an export so it can be called from commands/stop.js
  async disconnectTimervcidle(queue, DisconnectIdle, serverDisconnectIdle) {
    serverDisconnectIdle.disconnectTimer = setTimeout(
      disconnectvcidle,
      1800000,
      queue,
      DisconnectIdle,
      serverDisconnectIdle
    );
    console.log('Starting disconnectTimer Timeout');
  },
};
