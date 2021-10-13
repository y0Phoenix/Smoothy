//resumes the audioPlayer only if the audioPlayer is Paused
const { MessageEmbed } = require('discord.js');
var {AudioPlayerStatus,} = require('@discordjs/voice');
module.exports = {
    name: 'resume',
    description: 'resumes the current song',
    async resume(message,serverQueue){
        if(serverQueue !== undefined){
            if(serverQueue.player.state.status === AudioPlayerStatus.Paused){
                serverQueue.player.unpause();
                const resumEmbed = new MessageEmbed()
                    .setTitle(':arrow_forward: Resuming')
                    .setURL(`${serverQueue.songs[0].url}`)
                    .setDescription(`I Have Resumed ***${serverQueue.songs[0].title}***`)
                    .setThumbnail(`${serverQueue.songs[0].thumbnail}`)
                    .addField(`Requested By` , `<@${message.author.id}>`)
                    .setTimestamp();
                message.reply({embeds: [resumEmbed]});
            }else{
                message.reply(`:rofl: Not Currently Paused :rofl:`);
            }

        }else{
            message.reply(`:rofl: Not Currently Paused :rofl:`);
        }
    }
    
}