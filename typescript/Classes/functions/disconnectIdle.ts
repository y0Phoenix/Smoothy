import { MessageEmbed } from "discord.js";
import getMaps from "../../maps";
import { deleteMsg, leave } from "../../modules/modules";
import { Idle } from "../Idle";

/**
 *  @param  {} queue the map that holds all of the serverQueues
 *  @param  {} DisconnectIdle the map that holds all of the servers Idles
 *  @description disconnects from voiceConnection after 1800000 ms or 30 min
 */
export async function disconnectvcidle(DisconnectIdle: any, serverDisconnectIdle: Idle) {
    const vcIdleEmbed = new MessageEmbed()
      .setColor('RED')
      .setDescription(':cry: Left VC Due To Idle');
    const msg = await serverDisconnectIdle.message.channel.send({embeds: [vcIdleEmbed]});
    deleteMsg(msg, 60000, DisconnectIdle.get(1));
    console.log(`Left VC Due To Idle`);
    leave(serverDisconnectIdle.message);
  }
  
/**
 * @description starts the timer for 1800000 ms or 30 min which disconnects from voiceConnection
 * this timer only starts when the audioPlayer is Idle
 */
export function disconnectTimervcidle(this: Idle) {
    const maps = getMaps();
    const {DisconnectIdle} = maps;
    this.disconnectTimer = setTimeout(
      this.disconnectvcidle,
      1800000,
      DisconnectIdle,
      this
    );
    console.log('Starting disconnectTimer Timeout');
  }