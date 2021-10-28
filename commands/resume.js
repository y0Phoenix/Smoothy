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
                    .setColor('GREEN')
                    .setTitle(':arrow_forward: Resuming')
                    .setDescription(`I Have Resumed ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})***`)
                    .setThumbnail(`${serverQueue.currentsong[0].thumbnail}`)
                    .addFields(
                        {
                            name: `Requested By` , value: `<@${message.author.id}>`, inline: true,
                        },
                        {
                            name: `***Duration***`, value: `${serverQueue.currentsong[0].duration}`, inline: true
                        })
                    .setTimestamp();
                message.channel.send({embeds: [resumEmbed]});
            }else{
                message.channel.send(`:rofl: Not Currently Paused :rofl:`);
            }

        }else{
            message.channel.send(`:rofl: Not Currently Paused :rofl:`);
        }
    }
    
}