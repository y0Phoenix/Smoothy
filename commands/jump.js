//checks if serverQueue exists if the queue length is > 0 and if the song specified extist if it does serverQueue.jump is set to the specified int
const { MessageEmbed } = require('discord.js');
module.exports = {
    name:'jump',
    description: 'jumps to the specified song',
    async jump(message, args, serverQueue){
        var i = parseInt(args);
        if(serverQueue){
            if(serverQueue.loopsong === false){
                if(serverQueue.songs.length > 1){
                    if(serverQueue.songs[i]){
                        serverQueue.jump = i;
                        const jumpEmbed = new MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle('Jumping To Song')
                            .setDescription(`:arrow_heading_down: Now Jumping To ***[${serverQueue.songs[i].title}](${serverQueue.songs[i].url})***`)
                            .addField(`Requested By` , `<@${message.author.id}>`)
                            .setThumbnail(`${serverQueue.songs[i].thumbnail}`)
                            .setTimestamp();
                        message.reply({embeds: [jumpEmbed]});
                        serverQueue.player.stop();
                    }
                    else{
                        message.reply(':x: No Song Specified');
                    }
                }
                else{
                    message.reply(':x: No Other Songs Besides The Current Exist In The Queue :x:');
                }
            }
            else{
                message.reply(`:rofl: I Cannot Jump To A Song Wile I Am Looping A Song :rofl:`)
            }
        }else{
            message.reply(':rofl: I Dont Have A Song Queue :rofl:');
        }     
    }
}