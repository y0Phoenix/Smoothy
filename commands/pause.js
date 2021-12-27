//pauses the song at the front of the serverQueue
const { MessageEmbed } = require('discord.js');
const {deleteMsg, leave} = require('../modules/modules');
module.exports = {
    name: 'pause',
    description: 'pauses the current song',
    pause(message,serverQueue){
        if(serverQueue !== undefined){
            serverQueue.player.pause();
            const pauseEmbed = new MessageEmbed()
                .setColor('RED')
                .setDescription(`I Have Paused ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})***`)
                .addField(`Help` , `You Can Resume By Typing ***-resume***`)
                .addFields(
                    {
                        name: `Requested By` , value: `<@${message.author.id}>`, inline: true,
                    },
                    {
                        name: `***Duration***`, value: `${serverQueue.currentsong[0].duration}`, inline: true
                    }
                )
            ;
            message.channel.send({embeds: [pauseEmbed]})
            .then(msg => deleteMsg(msg, 60000, false));
        }
        else{
            message.channel.send(`:rofl: Nothing To Pause :rofl:`)
            .then(msg => deleteMsg(msg, 30000, false));
        }
    }
    
}