//resumes the audioPlayer only if the audioPlayer is Paused
const { MessageEmbed } = require('discord.js');
var {AudioPlayerStatus,} = require('@discordjs/voice');
const smoothy = require('../modules');
module.exports = {
    name: 'resume',
    description: 'resumes the current song',
    async resume(message,serverQueue){
        if(serverQueue){
            if(serverQueue.player.state.status === AudioPlayerStatus.Paused){
                serverQueue.player.unpause();
                const resumEmbed = new MessageEmbed()
                    .setColor('GREEN')
                    .setDescription(`I Have Resumed ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})***`)
                    .addFields(
                        {
                            name: `Requested By` , value: `<@${message.author.id}>`, inline: true,
                        },
                        {
                            name: `***Duration***`, value: `${serverQueue.currentsong[0].duration}`, inline: true
                        }
                    )
                ;
                message.channel.send({embeds: [resumEmbed]})
                .then(msg => smoothy.deleteMsg(msg, 60000));
            }else{
                message.channel.send(`:rofl: Not Currently Paused :rofl:`)
                .then(msg => smoothy.deleteMsg(msg, 30000));
            }

        }else{
            message.channel.send(`:rofl: Not Currently Paused :rofl:`)
            .then(msg => smoothy.deleteMsg(msg, 30000));
        }
    }
    
}