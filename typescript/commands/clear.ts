//stops the audioPlayer deletes serverQueue and starts the disconnecttimer
import { Colors, EmbedBuilder, Message } from 'discord.js';
import {deleteMsg, leave, writeGlobal} from '../modules/modules';
import Queue from '../Classes/Queue';
import { Idle } from '../Classes/Idle';
import sendMessage from '../modules/src/sendMessage';

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
        const stopEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(`:octagonal_sign: I Have ***Stopped*** The Music!`)
        ;
        sendMessage({embeds: [stopEmbed]}, message)
        .then(msg => deleteMsg(msg, 60000, serverDisconnectIdle.client));
        if (serverDisconnectIdle) {
            serverDisconnectIdle.disconnectTimervcidle();
        }
    }else{
        const notPlayingEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(`:rofl: Nothing ***Playing*** Currently!`)
        ;
        sendMessage({embeds: [notPlayingEmbed]}, message)
        .then(msg => deleteMsg(msg, 30000, serverDisconnectIdle.client));
    }
}
