//stops the audioPlayer which make AudioPlayerStatus Idle, which then exeuctes the function at ../executive.js(78)
const { MessageEmbed } = require('discord.js');
module.exports = {
    name: 'skip',
    description: 'skips the current song',
    async skip(message, serverQueue) {    
        if(serverQueue !== undefined){
            if (serverQueue.songs.length > 0 ) {
                if(serverQueue.shuffle === false){
                    console.log("Skipping" + serverQueue.currenttitle + "!");
                    const skipEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle('Skipping Song')
                        .setDescription(`:next_track: Now Skipping ***[${serverQueue.currenttitle}](${serverQueue.currentsong[0].url})***`)
                        .addField(`Requested By` , `<@${message.author.id}>`)
                        .setThumbnail(`${serverQueue.currentsong[0].thumbnail}`)
                        .setTimestamp();
                    message.reply({embeds: [skipEmbed]})
                    await serverQueue.player.stop();  
                }
                else{
                    console.log("Skipping" + serverQueue.currenttitle + "!");
                    const skipEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle('Skipping Song')
                        .setURL(`${serverQueue.shuffledSongs[0].url}`)
                        .setDescription(`:next_track: Now Skipping ***[${serverQueue.currenttitle}](${serverQueue.currentsong[0].url})***`)
                        .addField(`Requested By` , `<@${message.author.id}>`)
                        .setThumbnail(`${serverQueue.currentsong[0].thumbnail}`)
                        .setTimestamp();
                    message.reply({embeds: [skipEmbed]})
                    await serverQueue.player.stop();
                }
                
            }else{
                message.reply(':rofl: Nothing To ***Skip*** :rofl:');
            }
        }
    }
}