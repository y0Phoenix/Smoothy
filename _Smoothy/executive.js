//executive file holds all the executive functions and is the largest file
const ytpl = require('ytpl');
const {exists, writeGlobal, leave, deleteMsg } = require('./modules/modules');
const {
  createAudioPlayer,
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
const { default: play} = require('./Classes/functions/play');
const ytdl = require('ytdl-core');

const noVidEmbed = new MessageEmbed()
  .setColor('RED')
  .setDescription(':rofl: No ***video*** results found');


//creates the serverQueue which stores info about the songs, voiceConnection, audioPlayer, subscription, and textChannel
async function executive(message, queue, DisconnectIdle, serverDisconnectIdle, serverQueue, videoURL) {
  serverDisconnectIdle = DisconnectIdle.get(message.guild.id);
  const client = DisconnectIdle.get(1);
  if (!serverDisconnectIdle) {
    DisconnectIdle.set(message.guild.id, new Idle({message: message, client: client}));
    serverDisconnectIdle = DisconnectIdle.get(message.guild.id);
  }
  else {
    if (serverDisconnectIdle.disconnectTimer !== undefined) {
      clearTimeout(serverDisconnectIdle.disconnectTimer);
      console.log('Cleared Timout For disconnectTimer');
    }
  }
  //checks if a serverQueue exists if it doesn't it creates the queue, else the song is pushed into serverQueue.songs
  if (!serverQueue) {
    const data = {queue: queue, DisconnectIdle: DisconnectIdle, serverDisconnectIdle: serverDisconnectIdle, msg: message};
    const _queue = new Queue(data);
    queue.set(message.guild.id, _queue);
    serverQueue = queue.get(message.guild.id);
    const songObj = new Song({message: message, data: videoURL});
    serverQueue.songs.push(songObj);
    serverQueue.currentsong.push(songObj);
    writeGlobal('add queue', serverQueue, serverQueue.id);
    play(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
  }
  else {
    let songObj = new Song({message: message, data: videoURL});
    serverQueue.songs.push(songObj);
    writeGlobal('update queue', serverQueue, serverQueue.id);
    const addQueueEmbed = new MessageEmbed()
      .setColor('YELLOW')
      .setDescription(`***[${videoURL.videoDetails.title}](${videoURL.videoDetails.video_url})***
      Has Been Added To The Queue :arrow_down:`)
    ;
    let msg = await message.channel.send({ embeds: [addQueueEmbed] });
    serverDisconnectIdle.msgs.push(msg);
    writeGlobal('update dci', serverDisconnectIdle, serverDisconnectIdle.id);
    // if (!serverQueue) {
    //     await createServerQueue(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue);
    //     serverQueue = queue.get(message.guild.id);
    //     play(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
    // } else {
    //   if (!serverQueue.currentsong[0].load) {
    //     queuePush();
    //   }
    //   else {
    //     serverQueue.currentsong[0].load = false;
    //     await createServerQueue(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue);
    //     serverQueue = queue.get(message.guild.id);
    //     play(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
    //   }
    // }
  }
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
    const videoURL = await ytdl.getBasicInfo(videoName);
    if (videoURL) {
      console.log(`Found ${videoURL.videoDetails.title}`);
      executive(message, queue, DisconnectIdle, serverDisconnectIdle, serverQueue, videoURL);
    } else {
        message.channel
          .send({ embeds: [noVidEmbed] })
          .then((msg) => deleteMsg(msg, 30000, serverDisconnectIdle.client));
        return;
    }
  } else {
    video = await videoFinder(videoName);
    if (video) {
      const videoURL = await ytdl.getBasicInfo(video.url);
      console.log(`Found ${videoURL.videoDetails.title}`);
      executive(message, queue, DisconnectIdle, serverDisconnectIdle, serverQueue, videoURL);
    } else {
      message.channel
        .send({ embeds: [noVidEmbed] })
        .then((msg) => deleteMsg(msg, 30000, serverDisconnectIdle.client));
      return;
    }
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
      const videoURL = await ytdl.getBasicInfo(playlist.items[0].shortUrl);
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
        const data = {queue: queue, DisconnectIdle: DisconnectIdle, serverDisconnectIdle: serverDisconnectIdle, msg: message};
        queue.set(message.guild.id, new Queue(data));
        serverQueue = queue.get(message.guild.id);
        serverQueue.songs.push(new Song({message: message, data: videoURL}));
        serverQueue.currentsong.push(new Song({message: message, data: videoURL}));
        serverQueue.messagesent = true;
        console.log('Created the serverQueue');
        added = true;
        writeGlobal('add queue', serverQueue, serverQueue.id);
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
        .then((msg) => deleteMsg(msg, 30000, serverDisconnectIdle.client));
    }
  } else {
    const wrongEmbed = new MessageEmbed()
      .setColor('RED')
      .setDescription(':rofl: You Need To Add A Valid Playlist Link');
    message.channel
      .send({ embeds: [wrongEmbed] })
      .then((msg) => deleteMsg(msg, 30000, serverDisconnectIdle.client));
  }
}

async function joinvoicechannel(message, vc, DisconnectIdle, serverDisconnectIdle, client, bool) {
  if (VoiceConnectionStatus.Disconnected)
    voiceConnection = joinVoiceChannel({
      channelId: vc.id,
      guildId: vc.guild.id, 
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
  FindVideoCheck, 
  findvideoplaylist, 
  joinvoicechannel};
