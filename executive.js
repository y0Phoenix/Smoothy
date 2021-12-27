//executive file holds all the executive functions and is the largest file
const ytpl = require('ytpl');
const {exists, writeGlobal, leave, } = require('./modules/modules');
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
const { Idle } = require('./Classes/Idle');
const { PlaylistSong, Song } = require('./Classes/Song');
const { default: Queue } = require('./Classes/Queue');
const { validURL, videoFinder } = require('./Classes/functions/executive');

const noVidEmbed = new MessageEmbed()
  .setColor('RED')
  .setDescription(':rofl: No ***video*** results found');


async function checkIfPlaying(serverQueue) {
  if (serverQueue.player.state.status === AudioPlayerStatus.Playing) {
    return true;
  } else {
    return false;
  }
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
    id: message.guild.id,
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
  const bool = await exists(message.guild.id, 'queue');
  if (bool) {
    serverQueue = queue.get(message.guild.id);
    serverQueue.player = construct.player;
    serverQueue.subscription = construct.subscription;
  }
  else {
    queue.set(message.guild.id, construct);
    writeGlobal('add queue', queue.get(message.guild.id), message.guild.id);
  }
}

//creates the serverQueue which stores info about the songs, voiceConnection, audioPlayer, subscription, and textChannel
async function executive(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue, videoURL) {
  serverDisconnectIdle = DisconnectIdle.get(message.guild.id);
  if (serverDisconnectIdle.disconnectTimer !== undefined) {
    clearTimeout(serverDisconnectIdle.disconnectTimer);
    console.log('Cleared Timout For disconnectTimer');
  }
  //checks if a serverQueue exists if it doesn't it creates the queue, else the song is pushed into serverQueue.songs
  duration = durationCheck(videoURL.video_details.durationInSec);
  let durationms = parseInt(videoURL.video_details.durationInSec) * 1000;
  const queuePush = async () => {
    let songObj = new Song(serverQueue.message, )
    serverQueue.songs.push(songObj);
    writeGlobal('update queue', serverQueue, serverQueue.id);
  
    const addQueueEmbed = new MessageEmbed()
      .setColor('YELLOW')
      .setDescription(`***[${videoURL.video_details.title}](${videoURL.video_details.url})***
      Has Been Added To The Queue :arrow_down:`);
    let msg = await message.channel.send({ embeds: [addQueueEmbed] });
    serverDisconnectIdle.msgs.push(msg);
    writeGlobal('update dci', serverDisconnectIdle, serverDisconnectIdle.id);
  }
  if (!serverQueue) {
      await createServerQueue(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue);
      serverQueue = queue.get(message.guild.id);
      play(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
  } else {
    if (!serverQueue.currentsong[0].load) {
      queuePush();
    }
    else {
      serverQueue.currentsong[0].load = false;
      await createServerQueue(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue);
      serverQueue = queue.get(message.guild.id);
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
  writeGlobal('update queue', serverQueue, message.guild.id);
}

async function FindVideoCheck(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue) {
  let videoName;
  if (Array.isArray(args)) {
    videoName = args.join(' ');
  }
  else {
    videoName = args;
  }
  let URL = validURL(videoName);
  if (URL === true) {
    const videoURL = await playdl.video_info(videoName);
    if (videoURL) {
      console.log(`Found ${videoURL.video_details.title}`);
      executive(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue, videoURL);
    } else {
        message.channel
          .send({ embeds: [noVidEmbed] })
          .then((msg) => deleteMsg(msg, 30000, false));
        return;
    }
  } else {
    video = await videoFinder(videoName);
    if (video) {
      videoURL = await playdl.video_info(video.url);
      console.log(`Found ${videoURL.video_details.title}`);
      executive(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue);
    } else {
      message.channel
        .send({ embeds: [noVidEmbed] })
        .then((msg) => deleteMsg(msg, 30000, false));
      return;
    }
}

async function findvideoplaylist(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue) {
  serverDisconnectIdle = DisconnectIdle.get(message.guild.id);
  if (serverDisconnectIdle.disconnectTimer !== undefined) {
    clearTimeout(serverDisconnectIdle.disconnectTimer);
    console.log('Cleared Timout For disconnectTimer');
  }
  const videoName = args.join(' ');
  if (videoName.includes('/playlist')) {
    const playlist = await ytpl(videoName);
    var added = false;
    if (playlist) {
      const videoURL = await playdl.video_info(playlist.items[0].shortUrl);
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
        const setQueue = new Queue(message);
        queue.set(message.guild.id, setQueue);
        serverQueue = queue.get(message.guild.id);
        serverQueue.songs.push(new Song({message: message, data: videoURL}));
        serverQueue.messagesent = true;
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
          const songObj = new PlaylistSong({message: message, playlist: playlist.items[i]})
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
}

async function joinvoicechannel(message, vc, DisconnectIdle, serverDisconnectIdle, client, bool) {
  if (VoiceConnectionStatus.Disconnected)
    voiceConnection = joinVoiceChannel({
      channelId: vc.id,
      guild.id: vc.guild.id,
      adapterCreator: vc.guild.voiceAdapterCreator,
    });
  //sets the DisconnectIdle map
  if (!serverDisconnectIdle) {
    if (bool) {
    }
    else {
      DisconnectIdle.set(message.guild.id, new Idle({message: message, client: client}));
      await writeGlobal('add dci', DisconnectIdle.get(message.guild.id), message.guild.id);
    }
  }
}

module.exports = { 
  playNext, 
  disconnectTimervcidle, 
  loopNextSong, 
  findvideo, 
  findSplice, 
  FindVideoCheck, 
  findvideoplaylist, 
  joinvoicechannel};
