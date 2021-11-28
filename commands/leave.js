const {VoiceConnectionStatus, getVoiceConnection, AudioPlayerStatus,} = require('@discordjs/voice');
const { MessageEmbed } = require('discord.js');
const smoothy = require('../modules');
const noVCEmbed = new MessageEmbed()
        .setColor('RED')
        .setDescription(`:rofl: I Am Not In VC`)
    ;
module.exports = {
    name: 'leave',
    description: 'leaves the voice channel and clear the queue',
    leave(message, queue, serverQueue, DisconnectIdle, serverDisconnectIdle){
        const voiceConnection = getVoiceConnection(message.guild.id)
        if(voiceConnection){
            if(voiceConnection.state.status === VoiceConnectionStatus.Ready){
                const leaveEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setDescription(`:cry: Leaving Channel`)
                ;
                message.channel.send({embeds: [leaveEmbed]})
                .then(msg => smoothy.deleteMsg(msg, 60000));
                console.log('Left The Voice Channel From Command')
                if(serverQueue){
                    if(serverQueue.player.state.status === AudioPlayerStatus.Playing){
                        serverQueue.player.stop();    
                    }    
                }
                if(serverDisconnectIdle.disconnectTimer !== undefined){
                    clearTimeout(serverDisconnectIdle.disconnectTimer)
                }
                voiceConnection.disconnect();
                queue.delete(message.guild.id)
                DisconnectIdle.delete(message.guild.id)
            }
            else{
                message.channel.send({embeds: [noVCEmbed]})
                .then(msg => smoothy.deleteMsg(msg, 30000));
                return;
            }   
        }
        else{
            message.channel.send({embeds: [noVCEmbed]})
            .then(msg => smoothy.deleteMsg(msg, 30000));
            return;
        } 
    }
}