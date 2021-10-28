//removes a specified song inside of serverQueue using a number inside of args
const { MessageEmbed } = require('discord.js');
module.exports = {
    name: 'remove',
    description: 'removes specified song from the serverQueue',
    async remove(message, args, serverQueue) {
        var i = parseInt(args)
        if(serverQueue.shuffle === true){
            if(serverQueue.shuffledSongs[i]){
                const removeEmbed = new MessageEmbed()
                    .setColor('BLURPLE')
                    .setTitle(':eject: Removing Song')
                    .setURL(`${serverQueue.songs[i].url}`)
                    .setDescription(`I Have Removed ***[${serverQueue.shuffledSongs[i].title}](${serverQueue.shuffledSongs[i].url})***`)
                    .addFields(
                        {
                            name: `Requested By` , value: `<@${message.author.id}>`, inline: true,
                        },
                        {
                            name: `***Duration***`, value: `${serverQueue.shuffledSongs[i].duration}`, inline: true
                        })
                    .setThumbnail(`${serverQueue.shuffledSongs[i].thumbnail}`)
                    .setTimestamp();
                message.channel.send({embeds: [removeEmbed]});    
                serverQueue.shuffledSongs.splice(i, 1);
            }
            else{
                message.channel.send('No Song Specified');
            }
        }
        else{
            if(serverQueue.songs[i]){
                const removeEmbed = new MessageEmbed()
                    .setColor('BLURPLE')
                    .setTitle(':eject: Removing Song')
                    .setURL(`${serverQueue.songs[i].url}`)
                    .setDescription(`I Have Removed ***[${serverQueue.songs[i].title}](${serverQueue.songs[i].url})***`)
                    .addFields(
                        {
                            name: `Requested By` , value: `<@${message.author.id}>`, inline: true,
                        },
                        {
                            name: `***Duration***`, value: `${serverQueue.songs[i].duration}`, inline: true
                        })
                    .setThumbnail(`${serverQueue.songs[i].thumbnail}`)
                    .setTimestamp();
                message.channel.send({embeds: [removeEmbed]});    
                serverQueue.songs.splice(i, 1);
            }
            else{
                message.channel.send('No Song Specified');
            }
        }
    }
}