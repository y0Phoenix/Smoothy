//stops the audioPlayer deletes serverQueue and starts the disconnecttimer
const executive = require('../executive');
var {AudioPlayerStatus,
    } = require('@discordjs/voice');
const { MessageEmbed } = require('discord.js');
const {deleteMsg, leave} = require('../modules');
module.exports = {
    name: 'stop',
    description: 'stops playing and clears the queue',
    async stop(message, serverQueue, queue, DisconnectIdle, serverDisconnectIdle) {
        voiceChannel = message.member.voice.channel;
        if (serverQueue){
            serverQueue.stop = true;
            serverQueue.player.stop();
            queue.delete(message.guild.id);
            const stopEmbed = new MessageEmbed()
                .setColor('RED')
                .setDescription(`:octagonal_sign: I Have ***Stopped*** The Music!`)
            ;
            message.channel.send({embeds: [stopEmbed]})
            .then(msg => deleteMsg(msg, 60000, false));
            executive.disconnectTimervcidle(queue, DisconnectIdle, serverDisconnectIdle)
        }else{
            const notPlayingEmbed = new MessageEmbed()
                .setColor('RED')
                .setDescription(`:rofl: Nothing ***Playing*** Currently!`)
            ;
            message.channel.send({embeds: [notPlayingEmbed]})
            .then(msg => deleteMsg(msg, 30000, false));
        }
    }
}