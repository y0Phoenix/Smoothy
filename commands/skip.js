//stops the audioPlayer which make AudioPlayerStatus Idle, which then exeuctes the function at ../executive.js(78)
const { MessageEmbed } = require('discord.js');
const smoothy = require('../modules');
module.exports = {
    name: 'skip',
    description: 'skips the current song',
    async skip(message, serverQueue) {    
        if(serverQueue !== undefined){
            if (serverQueue.songs.length > 0 ) {
                console.log("Skipping " + serverQueue.currenttitle + "!");
                const skipEmbed = new MessageEmbed()
                    .setColor('AQUA')
                    .setDescription(`:next_track: Now Skipping ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})***`)
                    .addFields(
                        {
                            name: `Requested By` , value: `<@${message.author.id}>`, inline: true,
                        },
                        {
                            name: `***Duration***`, value: `${serverQueue.currentsong[0].duration}`, inline: true
                        }
                    )
                ;
                message.channel.send({embeds: [skipEmbed]})
                .then(msg => smoothy.deleteMsg(msg, 60000));
                serverQueue.player.stop();  
            }else{
                message.channel.send(':rofl: Nothing To ***Skip*** :rofl:')
                .then(msg => smoothy.deleteMsg(msg, 30000));
            }
        }
    }
}