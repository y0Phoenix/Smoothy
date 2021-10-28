//pauses the song at the front of the serverQueue
const { MessageEmbed } = require('discord.js');
module.exports = {
    name: 'pause',
    description: 'pauses the current song',
    async pause(message,serverQueue){
        if(serverQueue !== undefined){
            serverQueue.player.pause();
            const pauseEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle(':pause_button: Paused')
                .setDescription(`I Have Paused ***[${serverQueue.currenttitle}](${serverQueue.currentsong[0].url})***`)
                .addField(`Help` , `You Can Resume By Typing ***-resume***`)
                .setThumbnail(`${serverQueue.currentsong[0].thumbnail}`)
                .addFields(
                    {
                        name: `Requested By` , value: `<@${message.author.id}>`, inline: true,
                    },
                    {
                        name: `***Duration***`, value: `${serverQueue.currentsong[0].duration}`, inline: true
                    })
                .setTimestamp();
                message.channel.send({embeds: [pauseEmbed]})
        }
        else{
            message.channel.send(`:rofl: Nothing To Pause :rofl:`);
        }
    }
    
}