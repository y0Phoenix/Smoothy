//sets serverQueue.loopsong to true if false, else sets it to false
const { MessageEmbed } = require('discord.js');
module.exports = {
    name: 'loopsong',
    description: 'loops the current song',
    async loopsong(message, serverQueue){
        if(serverQueue){
            if(serverQueue.loopsong === false){
                serverQueue.loopsong = true
                const loopSongEmbed = new MessageEmbed()
                    .setColor('ORANGE')
                    .setDescription(`:thumbsup: Now Looping ***${serverQueue.currenttitle}*** :repeat_one:`)
                ;
                message.channel.send({embeds: [loopSongEmbed]})
            }
            else{
                serverQueue.loopsong = false
                const endLoopSongEmbed = new MessageEmbed()
                    .setColor('ORANGE')
                    .setDescription(`:x: No Longer Looping ***${serverQueue.currenttitle}***`)
                ;
                message.channel.send({embeds: [endLoopSongEmbed]})
            }
        }
        else{
            const notPlayingEmbed = new MessageEmbed()
                .setColor('ORANGE')
                .setDescription(`:rofl: Not Currently Playing Anything Right Now`)
            message.channel.send({embeds: [notPlayingEmbed]})
        }
    }
}