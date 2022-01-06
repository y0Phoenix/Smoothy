import {Idle} from "../Idle";
import Queue from "../Queue";
import playdl from 'play-dl';
import {
    AudioPlayerStatus,
    StreamType,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    getVoiceConnection,
    VoiceConnectionStatus,
    AudioPlayer, 
    PlayerSubscription, 
    VoiceConnection
  } from '@discordjs/voice';
  import { MessageEmbed } from 'discord.js';
  import {writeGlobal, deleteMsg} from '../../modules/modules';
  import audioPlayerIdle from './audioPlayerIdle';
import embedSend from "../../functions/embed";

/**
 * @param  {Queue} serverQueue the current servers queue
 * @param  {any} queue the map that holds all of the sever queues
 * @param  {any} DisconnectIdle the map that holds all of the server Idles
 * @param  {Idle} serverDisconnectIdle the current servers Idle
 */
export default async function play(serverQueue: Queue, queue: any, DisconnectIdle: any, serverDisconnectIdle: Idle) {
    let yturl: boolean;
    if (serverQueue.shuffle === true) {
      yturl = playdl.validate(serverQueue.shuffledSongs[0].url) ? true : false;
    } else {
      yturl = playdl.validate(serverQueue.currentsong[0].url) ? true : false;
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
                value: `<@${serverQueue.currentsong[0].message.author.id}>`,
                inline: true,
              },
              {
                name: `***Duration***`,
                value: `${serverQueue.currentsong[0].duration}`,
                inline: true,
              }
            )
            .setThumbnail(`${serverQueue.currentsong[0].thumbnail}`);
          serverQueue.nowPlaying = await embedSend(serverQueue.message, playembed, null);
          serverQueue.messagesent = true;
          writeGlobal('update queue', serverQueue, serverQueue.id)
        }
        serverQueue.repeat = false;
  
      } catch (err) {
        console.log(err);
      }
    } else {
        const noVidEmbed = new MessageEmbed()
            .setColor('RED')
            .setDescription(':rofl: No ***video*** results found');
        embedSend(serverQueue.message, noVidEmbed, 30000);
        serverQueue.player.stop();
        audioPlayerIdle(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
    }
  }