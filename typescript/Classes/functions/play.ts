import Queue from "../Queue";
import playdl from 'play-dl';
import {
    createAudioResource
  } from '@discordjs/voice';
  import { MessageEmbed } from 'discord.js';
  import {writeGlobal, deleteMsg} from '../../modules/modules';
import getMaps from "../../maps";

/**
 @description where the song gets played and the nowPlaying message gets set and sent
 */
export default async function play() {
  const {DisconnectIdle} = getMaps();
  const serverQueue: Queue = this;
    const yturl: boolean = playdl.validate(serverQueue.currentsong[0].url) ? true : false;
    if (yturl === true) {
      try {
        const stream = await playdl.stream(serverQueue.currentsong[0].url);
        serverQueue.resource = createAudioResource(stream.stream, {
          inputType: stream.type,
          inlineVolume: true,
        });
        serverQueue.resource.metadata = serverQueue;
        serverQueue.player.play(serverQueue.resource);
        console.log('Playing ' + serverQueue.currentsong[0].title + '!');
        if (serverQueue.audioPlayerErr === false) {
          serverQueue.nowPlaying = await serverQueue.nowPlayingSend();
          serverQueue.messagesent = true;
          writeGlobal('update queue', serverQueue, serverQueue.id)
        }
        serverQueue.repeat = false;
  
      } catch (err) {
        console.log(err);
        serverQueue.tries++;
        if (serverQueue.tries >= 5) {
          const msg = await serverQueue.message.channel.send({embeds: [new MessageEmbed()
            .setDescription(`Sorry There Was An Issue Playing ${serverQueue.currentsong[0].title} Playing Next Song`)
            .setColor('RED')]});
          deleteMsg(msg, 30000, DisconnectIdle.get(1));
          serverQueue.player.stop();
          serverQueue.audioPlayerIdle();
        }
        return play();

      }
    } else {
        const noVidEmbed = new MessageEmbed()
            .setColor('RED')
            .setDescription(':rofl: No ***video*** results found');
        serverQueue.message.channel.send({embeds: [noVidEmbed]});
        serverQueue.player.stop();
        serverQueue.audioPlayerIdle();
    }
  }