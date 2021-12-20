//checks if serverQueue exists if the queue length is > 0 and if the song specified extist if it does serverQueue.jump is set to the specified int
const { MessageEmbed } = require('discord.js');
const {deleteMsg, leave} = require('../modules');

module.exports = {
    name:'jump',
    description: 'jumps to the specified song',
    async jump(message, args, serverQueue, serverDisconnectIdle){
        var i = parseInt(args);
        if(serverQueue){
            if(serverQueue.loopsong === false){
                if(serverQueue.songs.length > 1){
                    if(serverQueue.shuffle === false){
                        if(serverQueue.songs[i]){
                            serverQueue.jump = i;
                                const jumpEmbed = new MessageEmbed()
                                .setColor('DARK_GOLD')
                                .setTitle('Jumping To Song')
                                .setDescription(`:arrow_heading_down: Now Jumping To ***[${serverQueue.songs[i].title}](${serverQueue.songs[i].url})***`)
                                .addFields(
                                    {
                                        name: `Requested By` , value: `<@${message.author.id}>`, inline: true,
                                    },
                                    {
                                        name: `***Duration***`, value: `${serverQueue.songs[i].duration}`, inline: true
                                    })
                                .setThumbnail(`${serverQueue.songs[i].thumbnail}`)
                                .setTimestamp();
                            message.channel.send({embeds: [jumpEmbed]})
                            .then(msg => deleteMsg(msg, 60000, false));
                            serverQueue.player.stop();
                        }
                        else{
                            message.channel.send(':x: No Song Specified')
                            .then(msg => deleteMsg(msg, 30000, false));
                        }
                    }
                    else{
                        if(serverQueue.shuffledSongs[i]){
                            serverQueue.jump = i;
                            const jumpEmbed = new MessageEmbed()
                                .setColor('DARK_GOLD')
                                .setTitle('Jumping To Song')
                                .setDescription(`:arrow_heading_down: Now Jumping To ***[${serverQueue.shuffledSongs[i].title}](${serverQueue.shuffledSongs[i].url})***`)
                                .addFields(
                                    {
                                        name: `Requested By` , value: `<@${message.author.id}>`, inline: true,
                                    },
                                    {
                                        name: `***Duration***`, value: `${serverQueue.shuffledSongs[i].duration}`, inline: true
                                    })
                                .setThumbnail(`${serverQueue.shuffledSongs[i].thumbnail}`)
                                .setTimestamp();
                            message.channel.send({embeds: [jumpEmbed]})
                            .then(msg => deleteMsg(msg, 60000, false));
                            serverQueue.player.stop();
                        }
                        else{
                            message.channel.send(':x: No Song Specified')
                            .then(msg => deleteMsg(msg, 30000, false));
                        }
                    }
                }
                else{
                    message.channel.send(':x: No Other Songs Besides The Current Exist In The Queue :x:')
                    .then(msg => deleteMsg(msg, 30000, false));
                }
            }
            else{
                message.channel.send(`:rofl: I Cannot Jump To A Song Wile I Am Looping A Song :rofl:`)
                .then(msg => deleteMsg(msg, 30000, false));
            }
        }else{
            message.channel.send(':rofl: I Dont Have A Song Queue :rofl:')
            .then(msg => deleteMsg(msg, 30000, false));
        }     
    }
}