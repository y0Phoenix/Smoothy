//stops the audioPlayer which make AudioPlayerStatus Idle, which then exeuctes the function at ../executive.js(78)
const { MessageEmbed } = require('discord.js');
module.exports = {
    name: 'skip',
    description: 'skips the current song',
    async skip(message, serverQueue) {    
        if(serverQueue !== undefined){
            if (serverQueue.songs.length > 0 ) {
                console.log("Skipping" + serverQueue.currenttitle + "!");
                const skipEmbed = new MessageEmbed()
                    .setColor('AQUA')
                    .setTitle('Skipping Song')
                    .setDescription(`:next_track: Now Skipping ***[${serverQueue.currenttitle}](${serverQueue.currentsong[0].url})***`)
                    .addFields(
                        {
                            name: `Requested By` , value: `<@${message.author.id}>`, inline: true,
                        },
                        {
                            name: `***Duration***`, value: `${serverQueue.currentsong[0].duration}`, inline: true
                        })
                    .setThumbnail(`${serverQueue.currentsong[0].thumbnail}`)
                    .setTimestamp();
                message.channel.send({embeds: [skipEmbed]})
                serverQueue.player.stop();  
            }else{
                message.channel.send(':rofl: Nothing To ***Skip*** :rofl:');
            }
        }
    }
}