//resumes the audioPlayer only if the audioPlayer is Paused
const { MessageEmbed } = require('discord.js');
var {AudioPlayerStatus,} = require('@discordjs/voice');
module.exports = {
    name: 'resume',
    description: 'resumes the current song',
    async resume(message,serverQueue){
        if(serverQueue){
            if(serverQueue.player.state.status === AudioPlayerStatus.Paused){
                serverQueue.player.unpause();
                const resumEmbed = new MessageEmbed()
                    .setTitle(':arrow_forward: Resuming')
                    .setDescription(`I Have Resumed ***[${serverQueue.currensong[0].title}](${serverQueue.currensong[0].url})***`)
                    .setThumbnail(`${serverQueue.currensong[0].thumbnail}`)
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