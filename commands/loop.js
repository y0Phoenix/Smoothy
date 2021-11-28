//sets serverQueue.loop to true if false, else sets it to false
const { MessageEmbed } = require('discord.js');
const smoothy = require('../modules');
module.exports = {
    name: 'loop',
    description: 'loops the current server queue',
    async loop(message, serverQueue,){
        if(serverQueue){   
            if(serverQueue.loop === false){
                serverQueue.loop = true;
                const loopEmbed = new MessageEmbed()
                    .setColor('PURPLE')
                    .setDescription(`:thumbsup: I Am Now Looping The Current Queue! :repeat:`)
                ;
                message.channel.send({embeds: [loopEmbed]})
                .then(msg => smoothy.deleteMsg(msg, serverQueue.currentsong[0].durationms));
            }
            else{
                serverQueue.loop = false;
                const endLoopEmbed = new MessageEmbed()
                    .setColor('PURPLE')
                    .setDescription(`:x: No Longer Looping The Queue!`)
                ;
                message.channel.send({embeds: [endLoopEmbed]})
                .then(msg => smoothy.deleteMsg(msg, 60000));
            } 
        }
        else{
            message.channel.send(':rofl: No Queue To Loop :rofl:')
            .then(msg => smoothy.deleteMsg(msg, 30000));
        }
    }
}