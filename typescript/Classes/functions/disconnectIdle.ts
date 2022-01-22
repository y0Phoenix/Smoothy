import { MessageEmbed } from "discord.js";
import getMaps from "../../maps";
import { leave } from "../../modules/modules";
import { Idle } from "../Idle";

/**
 *  @param  {} queue the map that holds all of the serverQueues
 *  @param  {} DisconnectIdle the map that holds all of the servers Idles
 *  @description disconnects from voiceConnection after 1800000 ms or 30 min
 */
export function disconnectvcidle(queue: any, DisconnectIdle: any, serverDisconnectIdle: Idle) {
    const vcIdleEmbed = new MessageEmbed()
      .setColor('RED')
      .setDescription(':cry: Left VC Due To Idle');
    serverDisconnectIdle.message.channel.send({embeds: [vcIdleEmbed]});
    console.log(`Left VC Due To Idle`);
    leave(serverDisconnectIdle.message, DisconnectIdle, queue);
  }
  
/**
 * @description starts the timer for 1800000 ms or 30 min which disconnects from voiceConnection
 * this timer only starts when the audioPlayer is Idle
 */
export function disconnectTimervcidle() {
    const maps = getMaps();
    const {DisconnectIdle, queue} = maps;
    this.disconnectTimer = setTimeout(
      this.disconnectvcidle,
      1800000,
      queue,
      DisconnectIdle,
      this
    );
    console.log('Starting disconnectTimer Timeout');
  }