const { MessageEmbed } = require("discord.js");
const smoothy = require('../modules');

//stops the audioPlayer and sets serverQueue.repeat to true, which is used inside of executive.js
module.exports = {
    name: 'repeat',
    description: 'repeats the current song',
    repeat(message, serverQueue){
        if(serverQueue){
            if(serverQueue.shuffledSongs.length > 0){
                serverQueue.player.stop();
                serverQueue.repeat = true
                const restartShuffleEmbed = new MessageEmbed()
                    .setColor('GREEN')
                    .setDescription(`:thumbsup: I Am Restarting ***[${serverQueue.shuffledSongs[0].title}](${serverQueue.shuffledSongs[0].url})*** :arrows_counterclockwise:`)
                ;
                message.channel.send({embeds: [restartShuffleEmbed]})
                .then(msg => smoothy.deleteMsg(msg, 60000));
            }
            else if(serverQueue.songs.length > 0){
                serverQueue.player.stop();
                serverQueue.repeat = true
                const restartCurrentEmbed = new MessageEmbed()
                    .setColor('GREEN')
                    .setDescription(`:thumbsup: I Am Restarting ***[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})*** :arrows_counterclockwise:`)
                ;
                message.channel.send({embeds: [restartCurrentEmbed]})
                .then(msg => smoothy.deleteMsg(msg, 60000));
            }
            else{
                const notPlayingEmbed = new MessageEmbed()
                    .setColor('GREEN')
                    .setDescription(`:rofl: Not Currently Playing Anything At The Moment`)
                ;
                message.channel.send({embeds: [notPlayingEmbed]})
                .then(msg => smoothy.deleteMsg(msg, 30000));
            }
        }
        else{
            const notPlayingEmbed = new MessageEmbed()
                .setColor('GREEN')
                .setDescription(`:rofl: Not Currently Playing Anything At The Moment`)
            ;
            message.channel.send({embeds: [notPlayingEmbed]})   
            .then(msg => smoothy.deleteMsg(msg, 30000));     
        }
    }
}