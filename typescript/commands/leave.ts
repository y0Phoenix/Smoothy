import {VoiceConnectionStatus, getVoiceConnection, AudioPlayerStatus,} from '@discordjs/voice';
import { MessageEmbed, Message } from 'discord.js';
import { Idle } from '../Classes/Idle';
import Queue from '../Classes/Queue';
import {deleteMsg, leave} from '../modules/modules';
const noVCEmbed = new MessageEmbed()
        .setColor('RED')
        .setDescription(`:rofl: I Am Not In VC`)
    ;

/**
 * @param  {Message} message the message from the channel 
 * @param  {any} queue the map that holds all of the queues
 * @param  {Queue} serverQueue the current servers queue
 * @param  {any} DisconnectIdle the map that holds all of the idles
 * @param  {Idle} serverDisconnectIdle current servers idle
 * @description leaves the voice channel, deletes the serverQueue from the queue map and deletes all the messages inside the serverDisconnectIdle msgs and queueMSGs arrays
 */
export default async function Leave(message: Message, serverQueue: Queue, DisconnectIdle: any, serverDisconnectIdle: Idle){
    const voiceConnection = getVoiceConnection(message.guild.id);
    if(voiceConnection){
        const leaveEmbed = new MessageEmbed()
            .setColor('RED')
            .setDescription(`:cry: Leaving Channel`)
        ;
        message.channel.send({embeds: [leaveEmbed]})
        .then(msg => deleteMsg(msg, 60000, serverDisconnectIdle.client));
        console.log('Left The Voice Channel From Command')
        if(serverQueue){
            if(serverQueue.player.state.status === AudioPlayerStatus.Playing){
                serverQueue.stop = true;
                serverQueue.player.stop();    
            }    
        }
        if(serverDisconnectIdle.disconnectTimer !== undefined){
            clearTimeout(serverDisconnectIdle.disconnectTimer)
        }
        leave(message); 
    }
    else{
        message.channel.send({embeds: [noVCEmbed]})
        .then(msg => deleteMsg(msg, 30000, DisconnectIdle.get(1)));
        return;
    } 
}