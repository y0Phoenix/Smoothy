import Queue from "../Queue";
import { AudioPlayerStatus } from "@discordjs/voice";
import { Colors, EmbedBuilder } from "discord.js";
import { deleteMsg, find } from "../../modules/modules";
import getMaps from "../../maps";

/**
 * @description checks if the serverQueue is playing a song via
 * AudioPlayerStatus
 * @returns {boolean} boolean value
 */
export function checkIfPlaying() {
  const serverQueue: Queue = this;
  if (serverQueue.player.state.status === AudioPlayerStatus.Playing) {
      return true;
  } else {
      return false;
  }
}
/**
 * @description retry function for serverQueue.player on an error 
 */
export async function retryTimer() {
    const serverQueue: Queue = this;
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
          const errorEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(`:thumbsdown: [${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url}) failed to play reverting to original queue try again later`)
          ;
          serverQueue.message.reply({embeds: [errorEmbed]});
        }
      }
      serverQueue.currentsong.shift();
      await serverQueue.getVideo();
      console.log(
        `Retrying ${serverQueue.currentsong[0].title} at ${serverQueue.currentsong[0].url}`
      );
      serverQueue.play();
      if (serverQueue.tries >= 4) {
        serverQueue.message.reply(`Smoothy Is Buffering Please Wait`)
          .then((msg) => deleteMsg(msg, 30000, serverDisconnectIdle.client));
      }
    }
  }