import { Client, Message, MessageEmbed } from 'discord.js';
import WriteMessage from "./WriteMessage";
import { leave } from '../modules/modules';
import getMaps from '../maps';

export class WriteIdle {
    message: WriteMessage
    id: string
    client: Client
    disconnectTimer: any = null
    msgs: Partial<WriteMessage>[] = []
    queueMsgs: Partial<WriteMessage>[] = []
    constructor (data) {
        this.message = new WriteMessage(data.message);
        this.id = data.message.guild.id;
        this.client = null;
        if (!data.msgs) {
        }
        else {
            data.msgs.forEach(msg => {
                this.msgs.push(new WriteMessage(msg));
            });
            data.queueMsgs.forEach(msg => {
                this.queueMsgs.push(new WriteMessage(msg));
            });
        }
    }
}
export class Idle {
    message: Message
    id: string
    client: Client
    disconnectTimer: any
    msgs: Partial<Message>[] = []
    queueMsgs: Partial<Message>[] = []
    constructor (data) {
        this.message = data.message;
        this.id = data.message.guild.id;
        this.client = data.client;
    }
    /**
 *@param  {} queue the map that holds all of the serverQueues
 * @param  {} DisconnectIdle the map that holds all of the servers Idles
 * @description disconnects from voiceConnection after 1800000 ms or 30 min
 */
disconnectvcidle(queue: any, DisconnectIdle: any) {
    const vcIdleEmbed = new MessageEmbed()
      .setColor('RED')
      .setDescription(':cry: Left VC Due To Idle');
    this.message.channel.send({embeds: [vcIdleEmbed]});
    console.log(`Left VC Due To Idle`);
    leave(queue, DisconnectIdle, this.message);
  }
  
  /**
   * @description starts the timer for 1800000 ms or 30 min which disconnects from voiceConnection
   * this timer only starts when the audioPlayer is Idle
   */
  disconnectTimervcidle() {
    const maps = getMaps();
    const {DisconnectIdle, queue} = maps;
    this.disconnectTimer = setTimeout(
      this.disconnectvcidle,
      1800000,
      queue,
      DisconnectIdle
    );
    console.log('Starting disconnectTimer Timeout');
  }
}