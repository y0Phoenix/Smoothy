import { Idle } from "../Idle";
import Queue from "../Queue";
import { AudioPlayerStatus } from "@discordjs/voice";
import { MessageEmbed } from "discord.js";
import { deleteMsg, find } from "../../modules/modules";
import getVideo from './getVideo';
import getMaps from "../../maps";

/**
 * @param  {Queue} serverQueue the current servers queue
 * @description checks if the serverQueue is playing a song via
 * AudioPlayerStatus
 * @returns {boolean} boolean value
 */
export async function checkIfPlaying(serverQueue: Queue) {
  if (serverQueue.player.state.status === AudioPlayerStatus.Playing) {
      return true;
  } else {
      return false;
  }
}
/**
 */
export async function retryTimer() {
    const serverQueue = this;
    const maps = getMaps();
    const serverDisconnectIdle = maps.DisconnectIdle.get(serverQueue.id);
    if (serverQueue.player.state.status !== AudioPlayerStatus.Playing && serverQueue.tries < 5 && serverQueue.loop === false) {
      if (serverQueue.jumpbool === true) {
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
          serverQueue.message.channel.send({embeds: [errorEmbed]});
        }
      }
      serverQueue.currentsong.shift();
      await serverQueue.getVideo();
      console.log(
        `Retrying ${serverQueue.currentsong[0].title} at ${serverQueue.currentsong[0].url}`
      );
      serverQueue.play(maps.queue, maps.DisconnectIdle, serverDisconnectIdle);
      if (serverQueue.tries >= 4) {
        serverQueue.message.channel
          .send(`Smoothy Is Buffering Please Wait`)
          .then((msg) => deleteMsg(msg, 30000, serverDisconnectIdle.client));
      }
    }
  }