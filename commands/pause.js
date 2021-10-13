const { MessageEmbed } = require('discord.js');
module.exports = {
    name: 'pause',
    description: 'pauses the current song',
    async pause(message,serverQueue){
        if(serverQueue !== undefined){
            serverQueue.player.pause();
            const pauseEmbed = new MessageEmbed()
                .setTitle(':pause_button: Paused')
                .setURL(`${serverQueue.songs[0].url}`)
                .setDescription(`I Have Paused ***${serverQueue.songs[0].title}***
                You Can Resume By Typing ***-resume***`)
                .setThumbnail(`${serverQueue.songs[0].thumbnail}`)
                .addField(`Requested By` , `<@${message.author.id}>`)
                .setTimestamp();
            message.reply({embeds: [pauseEmbed]});
        }
        else{
            message.reply(`:rofl: Nothing To Pause :rofl:`);
        }
    }
    
}