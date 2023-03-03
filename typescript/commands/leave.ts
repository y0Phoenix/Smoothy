import {VoiceConnectionStatus, getVoiceConnection, AudioPlayerStatus,} from '@discordjs/voice';
import { Colors, EmbedBuilder, Message } from 'discord.js';
import { Idle } from '../Classes/Idle';
import Queue from '../Classes/Queue';
import {deleteMsg, leave} from '../modules/modules';
const noVCEmbed = new EmbedBuilder()
        .setColor(Colors.Red)
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
        const leaveEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(`:cry: Leaving Channel`)
        ;
        message.reply({embeds: [leaveEmbed]})
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
        message.reply({embeds: [noVCEmbed]})
        .then(msg => deleteMsg(msg, 30000, DisconnectIdle.get(1)));
        return;
    } 
}