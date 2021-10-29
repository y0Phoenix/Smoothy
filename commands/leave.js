const {VoiceConnectionStatus, getVoiceConnection, AudioPlayerStatus,} = require('@discordjs/voice');
const { MessageEmbed } = require('discord.js');
module.exports = {
    name: 'leave',
    description: 'leaves the voice channel and clear the queue',
    leave(message, queue, serverQueue, DisconnectIdle, serverDisconnectIdle){
        if(serverQueue){
            var voiceConnection = getVoiceConnection(message.guild.id)
            if(voiceConnection.state.status === VoiceConnectionStatus.Ready){
                const leaveEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setDescription(`:cry: Leaving Channel`)
                ;
                message.channel.send({embeds: [leaveEmbed]})
                console.log('Left The Voice Channel From Command')
                if(serverQueue.player.state.status === AudioPlayerStatus.Playing){
                    serverQueue.player.stop();    
                } 
                if(serverDisconnectIdle.disconnectTimer !== undefined){
                    clearTimeout(serverDisconnectIdle.disconnectTimer)
                }
                voiceConnection.disconnect();
                queue.delete(message.guild.id)
                DisconnectIdle.delete(message.guild.id)
            }
            else{
                const noVCEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setDescription(`:rofl: I Am Not In VC`)
                ;
                message.channel.send({embeds: [noVCEmbed]});
                return;
            }
        }     
    }
}