//sets serverQueue.loop to true if false, else sets it to false
import { Colors, EmbedBuilder, Message } from 'discord.js';
import { Idle } from '../Classes/Idle';
import Queue from '../Classes/Queue';
import {deleteMsg, writeGlobal} from '../modules/modules';
import sendMessage from '../modules/src/sendMessage';

/**
 * @param  {Message} message the users message
 * @param  {Queue} serverQueue the current servers Queue
 * @param  {Idle} serverDisconnectIdle the current servers Idle
 * @description sets the loop boolean inside serverQueue to true
 */
export default async function loop(message: Message, serverQueue: Queue, serverDisconnectIdle: Idle){
    if(serverQueue){   
        if(serverQueue.loop === false){
            serverQueue.loop = true;
            const loopEmbed = new EmbedBuilder()
                .setColor(Colors.Purple)
                .setDescription(`:thumbsup: I Am Now Looping The Current Queue! :repeat:`)
            ;
            let msg = await sendMessage({embeds: [loopEmbed]}, message);
            serverDisconnectIdle.msgs.push(msg);
            writeGlobal('update dci', serverDisconnectIdle, message.guildId);
            writeGlobal('update queue', serverQueue, message.guildId);
        }
        else{
            serverQueue.loop = false;
            const endLoopEmbed = new EmbedBuilder()
                .setColor(Colors.Purple)
                .setDescription(`:x: No Longer Looping The Queue!`)
            ;
            sendMessage({embeds: [endLoopEmbed]}, message)
            .then(msg => deleteMsg(msg, 60000, serverDisconnectIdle.client));
            writeGlobal('update queue', serverQueue, message.guildId);
        } 
    }
    else{
        sendMessage(':rofl: No Queue To Loop :rofl:', message)
        .then(msg => deleteMsg(msg, 30000, serverDisconnectIdle.client));
    }
}