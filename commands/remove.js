const { MessageEmbed } = require('discord.js');
module.exports = {
    name: 'remove',
    description: 'removes specified song from the serverQueue',
    async remove(message, args, serverQueue) {
        var i = parseInt(args)
        if(serverQueue.songs[i]){
            const removeEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(':eject: Removing Song')
                .setURL(`${serverQueue.songs[i].url}`)
                .setDescription(`I Have Removed ***${serverQueue.songs[i].title}***`)
                .addField(`Requested By` , `<@${message.author.id}>`)
                .setThumbnail(`${serverQueue.songs[i].thumbnail}`)
                .setTimestamp();
            message.reply({embeds: [removeEmbed]});    
            serverQueue.songs.splice(i, 1);
        }
        else{
            message.reply('No Song Specified');
        }
    }
}