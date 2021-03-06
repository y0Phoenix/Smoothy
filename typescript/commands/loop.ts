//sets serverQueue.loop to true if false, else sets it to false
import { MessageEmbed, Message } from 'discord.js';
import { Idle } from '../Classes/Idle';
import Queue from '../Classes/Queue';
import {deleteMsg, writeGlobal} from '../modules/modules';

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
            const loopEmbed = new MessageEmbed()
                .setColor('PURPLE')
                .setDescription(`:thumbsup: I Am Now Looping The Current Queue! :repeat:`)
            ;
            let msg = await message.channel.send({embeds: [loopEmbed]});
            serverDisconnectIdle.msgs.push(msg);
            writeGlobal('update dci', serverDisconnectIdle, message.guildId);
            writeGlobal('update queue', serverQueue, message.guildId);
        }
        else{
            serverQueue.loop = false;
            const endLoopEmbed = new MessageEmbed()
                .setColor('PURPLE')
                .setDescription(`:x: No Longer Looping The Queue!`)
            ;
            message.channel.send({embeds: [endLoopEmbed]})
            .then(msg => deleteMsg(msg, 60000, serverDisconnectIdle.client));
            writeGlobal('update queue', serverQueue, message.guildId);
        } 
    }
    else{
        message.channel.send(':rofl: No Queue To Loop :rofl:')
        .then(msg => deleteMsg(msg, 30000, serverDisconnectIdle.client));
    }
}