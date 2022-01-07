//stops the audioPlayer which make AudioPlayerStatus Idle, which then exeuctes the function at ../executive.js(78)
const { MessageEmbed } = require('discord.js');
const {deleteMsg, leave, writeGlobal} = require('../modules/modules');

module.exports = {
    name: 'skip',
    description: 'skips the current song',
    async skip(message, serverQueue, client) {    
        if(serverQueue !== undefined){
            if (serverQueue.songs.length > 0 ) {
                try {
                    console.log("Skipping " + serverQueue.currentsong[0].title + "!");
                    const skipEmbed = new MessageEmbed()
                        .setColor('AQUA')
                        .setDescription(`:next_track: Skipping 
                        ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})***`)
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
                    .then(msg => deleteMsg(msg, 60000, client));
                    await serverQueue.nowPlaying.delete();
                    serverQueue.nowPlaying = undefined;
                    clearTimeout(serverQueue.nowPlayingMsgTimer);
                    serverQueue.player.stop();  
                    }
                    catch(error) {
                        console.log('Unknown MSG');
                    }
            }else{
                message.channel.send(':rofl: Nothing To ***Skip*** :rofl:')
                .then(msg => deleteMsg(msg, 30000, client));
            }
        }
    }
}