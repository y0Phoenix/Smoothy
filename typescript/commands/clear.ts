//stops the audioPlayer deletes serverQueue and starts the disconnecttimer
import { MessageEmbed, Message } from 'discord.js';
import {deleteMsg, leave, writeGlobal} from '../modules/modules';
import Queue from '../Classes/Queue';
import { Idle } from '../Classes/Idle';

/**
 * @param  {Message} message the users Message
 * @param  {Queue} serverQueue the current servers Queue
 * @param  {any} queue the map that holds all of the Queues
 * @param  {Idle} serverDisconnectIdle the current servers Idles
 * @description sets the serverQueue.stop bool to true, deletes the serverQueue from the 
 * queue map and starts the {@link serverDisconnectIdle.disconnectTimervcidle}
 */
export default async function clear(message: Message, serverQueue: Queue, queue: any, serverDisconnectIdle: Idle) {
    const voiceChannel = message.member.voice.channel;
    if (serverQueue){
        if (!serverQueue.player) {
        }
        else {
            serverQueue.stop = true;
            serverQueue.player.stop();
        }
        queue.delete(message.guildId);
        await writeGlobal('delete queue', null, serverQueue.id);
        writeGlobal('delete dci', null, serverQueue.id);
        const stopEmbed = new MessageEmbed()
            .setColor('RED')
            .setDescription(`:octagonal_sign: I Have ***Stopped*** The Music!`)
        ;
        message.channel.send({embeds: [stopEmbed]})
        .then(msg => deleteMsg(msg, 60000, serverDisconnectIdle.client));
        if (serverDisconnectIdle) {
            serverDisconnectIdle.disconnectTimervcidle();
        }
    }else{
        const notPlayingEmbed = new MessageEmbed()
            .setColor('RED')
            .setDescription(`:rofl: Nothing ***Playing*** Currently!`)
        ;
        message.channel.send({embeds: [notPlayingEmbed]})
        .then(msg => deleteMsg(msg, 30000, serverDisconnectIdle.client));
    }
}
