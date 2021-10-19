//pauses the song at the front of the serverQueue
const { MessageEmbed } = require('discord.js');
module.exports = {
    name: 'pause',
    description: 'pauses the current song',
    async pause(message,serverQueue){
        if(serverQueue !== undefined){
            serverQueue.player.pause();
            const pauseEmbed = new MessageEmbed()
                .setTitle(':pause_button: Paused')
                .setDescription(`I Have Paused ***[${serverQueue.currenttitle}](${serverQueue.currentsong[0].url})***`)
                .addField(`Help` , `You Can Resume By Typing ***-resume***`)
                .setThumbnail(`${serverQueue.currentsong[0].thumbnail}`)
                .addField(`Requested By` , `<@${message.author.id}>`)
                .setTimestamp();
            message.reply({embeds: [pauseEmbed]});
        }
        else{
            message.reply(`:rofl: Nothing To Pause :rofl:`);
        }
    }
    
}