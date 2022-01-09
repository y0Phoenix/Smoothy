//stops the audioPlayer deletes serverQueue and starts the disconnecttimer
import {AudioPlayerStatus,
    } from '@discordjs/voice';
import { MessageEmbed, Message } from 'discord.js';
import {deleteMsg, leave, writeGlobal} from '../modules/modules';
import Queue from '../Classes/Queue';
import { Idle } from '../Classes/Idle';
module.exports = {
    name: 'stop',
    description: 'stops playing and clears the queue',
    /**
     * @param  {Message} message the users Message
     * @param  {Queue} serverQueue the current servers Queue
     * @param  {any} queue the map that holds all of the Queues
     * @param  {any} DisconnectIdle the map that holds all of the Idles
     * @param  {Idle} serverDisconnectIdle the current servers Idles
     * @description sets the serverQueue.stop bool to true, deletes the serverQueue from the 
     * queue map and starts the {@link serverDisconnectIdle.disconnectTimervcidle}
     */
    async stop(message: Message, serverQueue: Queue, queue: any, DisconnectIdle: any, serverDisconnectIdle: Idle) {
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
                serverDisconnectIdle.disconnectTimervcidle(queue, DisconnectIdle);
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
}