//removes a specified song inside of serverQueue using a number inside of args
const { MessageEmbed } = require('discord.js');
const {deleteMsg, leave, find} = require('../modules');

module.exports = {
    name: 'remove',
    description: 'removes specified song from the serverQueue',
    async remove(message, args, serverQueue) {
        var i = parseInt(args);
        var query = args.join(' ');
        if (isNaN(i)) {
            const result = await find(serverQueue, query);
            if (result !== null) {
                if (result.shuffledSong) {
                    i = result.shuffledSong;
                    serverQueue.songs.splice(result.song, 1);
                }
                else {
                    i = result.song;
                }
            }
        }
        if(serverQueue.shuffle === true){
            const result = await find(serverQueue, serverQueue.shuffledSongs[i].title);
            serverQueue.songs.splice(result.song, 1);
            if(serverQueue.shuffledSongs[i]){
                const removeEmbed = new MessageEmbed()
                    .setColor('BLURPLE')
                    .setDescription(`I Have Removed ***[${serverQueue.shuffledSongs[i].title}](${serverQueue.shuffledSongs[i].url})***`)
                    .addFields(
                        {
                            name: `Requested By` , value: `<@${message.author.id}>`, inline: true,
                        },
                        {
                            name: `***Duration***`, value: `${serverQueue.shuffledSongs[i].duration}`, inline: true
                        })
                message.channel.send({embeds: [removeEmbed]})
                .then(msg => deleteMsg(msg, 60000, false));   
                serverQueue.shuffledSongs.splice(i, 1);
            }
            else{
                message.channel.send('No Song Specified')
                .then(msg => deleteMsg(msg, 30000, false));
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
                message.channel.send({embeds: [removeEmbed]})
                .then(msg => deleteMsg(msg, 60000, false));   
                serverQueue.songs.splice(i, 1);
            }
            else{
                message.channel.send('No Song Specified')
                .then(msg => deleteMsg(msg, 30000, false));
            }
        }
    }
}