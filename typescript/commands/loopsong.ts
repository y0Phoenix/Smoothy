//sets serverQueue.loopsong to true if false, else sets it to false
import { MessageEmbed, Message } from 'discord.js';
import { Idle } from '../Classes/Idle';
import Queue from '../Classes/Queue';
import {deleteMsg, leave, writeGlobal} from '../modules/modules';

/**
 * @param  {Message} message the users message
 * @param  {Queue} serverQueue the current servers Queue
 * @param  {Idle} serverDisconnectIdle the current servers Idle
 * @description sets the loopsong boolean to true inside the serverQueue
 */
export default async function loopsong(message: Message, serverQueue: Queue, serverDisconnectIdle: Idle){
    if(serverQueue){
        if(serverQueue.loopsong === false){
            serverQueue.loopsong = true
            const loopSongEmbed = new MessageEmbed()
                .setColor('ORANGE')
                .setDescription(`:thumbsup: Now Looping ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})*** :repeat_one:`)
            ;
            let msg = await message.channel.send({embeds: [loopSongEmbed]});
            serverDisconnectIdle.msgs.push(msg);
            await writeGlobal('update dci', serverDisconnectIdle, message.guildId);
            writeGlobal('update queue', serverQueue, message.guildId);
        }
        else{
            serverQueue.loopsong = false
            const endLoopSongEmbed = new MessageEmbed()
                .setColor('ORANGE')
                .setDescription(`:x: No Longer Looping ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})***`)
            ;
            message.channel.send({embeds: [endLoopSongEmbed]})
            .then(msg => deleteMsg(msg, 60000, serverDisconnectIdle.client));
            writeGlobal('update queue', serverQueue, message.guildId);
        }
    }
    else{
        const notPlayingEmbed = new MessageEmbed()
            .setColor('ORANGE')
            .setDescription(`:rofl: Nothing Playing Right Now`)
        message.channel.send({embeds: [notPlayingEmbed]})
        .then(msg => deleteMsg(msg, 30000, serverDisconnectIdle.client));
    }
}