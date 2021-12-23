//sets serverQueue.loopsong to true if false, else sets it to false
const { MessageEmbed } = require('discord.js');
const {deleteMsg, leave, writeGlobal} = require('../modules');

 module.exports = {
    name: 'loopsong',
    description: 'loops the current song',
    async loopsong(message, serverQueue, serverDisconnectIdle){
        if(serverQueue){
            if(serverQueue.loopsong === false){
                serverQueue.loopsong = true
                const loopSongEmbed = new MessageEmbed()
                    .setColor('ORANGE')
                    .setDescription(`:thumbsup: Now Looping ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})*** :repeat_one:`)
                ;
                let msg = await message.channel.send({embeds: [loopSongEmbed]});
                serverDisconnectIdle.msgs.push(msg);
                await writeGlobal('update dci', serverDisconnectIdle, message.guildId);
                writeGlobal('update queue', serverQueue, message.guildId);
            }
            else{
                serverQueue.loopsong = false
                const endLoopSongEmbed = new MessageEmbed()
                    .setColor('ORANGE')
                    .setDescription(`:x: No Longer Looping ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})***`)
                ;
                message.channel.send({embeds: [endLoopSongEmbed]})
                .then(msg => deleteMsg(msg, 60000, false));
                writeGlobal('update queue', serverQueue, message.guildId);
            }
        }
        else{
            const notPlayingEmbed = new MessageEmbed()
                .setColor('ORANGE')
                .setDescription(`:rofl: Nothing Playing Right Now`)
            message.channel.send({embeds: [notPlayingEmbed]})
            .then(msg => deleteMsg(msg, 30000, false));
        }
    }
}