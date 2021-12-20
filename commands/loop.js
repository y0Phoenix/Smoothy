//sets serverQueue.loop to true if false, else sets it to false
const { MessageEmbed } = require('discord.js');
const {deleteMsg, leave} = require('../modules');

module.exports = {
    name: 'loop',
    description: 'loops the current server queue',
    async loop(message, serverQueue, serverDisconnectIdle){
        if(serverQueue){   
            if(serverQueue.loop === false){
                serverQueue.loop = true;
                const loopEmbed = new MessageEmbed()
                    .setColor('PURPLE')
                    .setDescription(`:thumbsup: I Am Now Looping The Current Queue! :repeat:`)
                ;
                let msg = await message.channel.send({embeds: [loopEmbed]});
                serverDisconnectIdle.msgs.push(msg);
            }
            else{
                serverQueue.loop = false;
                const endLoopEmbed = new MessageEmbed()
                    .setColor('PURPLE')
                    .setDescription(`:x: No Longer Looping The Queue!`)
                ;
                message.channel.send({embeds: [endLoopEmbed]})
                .then(msg => deleteMsg(msg, 60000, false));
            } 
        }
        else{
            message.channel.send(':rofl: No Queue To Loop :rofl:')
            .then(msg => deleteMsg(msg, 30000, false));
        }
    }
}