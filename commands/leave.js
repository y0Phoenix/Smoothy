var {VoiceConnectionStatus, getVoiceConnection, AudioPlayerStatus,} = require('@discordjs/voice');
module.exports = {
    name: 'leave',
    description: 'leaves the voice channel and clear the queue',
    leave(message, queue, serverQueue, DisconnectIdle, serverDisconnectIdle){
        if(serverQueue){
            var voiceConnection = getVoiceConnection(message.guild.id)
            if(voiceConnection.state.status === VoiceConnectionStatus.Ready){
                message.channel.send(':cry: Leaving Channel :cry:')
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
                message.reply(':rofl: I Am Not In VC :rofl:');
                return;
            }
        }     
    }
}