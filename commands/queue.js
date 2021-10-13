const { MessageEmbed } = require('discord.js');
let queuelist = ``;
async function getQueueList(serverQueue) {
    for (i = 1; 
    i < serverQueue.songs.length; 
    i++){
        queuelist += `\n***${i}*** : **${serverQueue.songs[i].title}**\nRequested By: <@${serverQueue.songs[i].message.author.id}>`        
    }
    
}


module.exports = {
    name: 'queue',
    description: 'Shows queue to the discord text channel',
    async execute(message, serverQueue){
        if(serverQueue !== undefined){
            if(serverQueue.songs.length > 2 || serverQueue.songs.length === 2){
                if(serverQueue.loopsong === true){
                    await getQueueList(serverQueue)
                    const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(':thumbsup: Here Is The Queue')
                        .addFields(
                            {
                                name: 'Looped Song', 
                                value: serverQueue.songs[0].title
                            },
                            {
                                name: 'Requested By',
                                value: `<@${serverQueue.songs[0].message.author.id}>`
                            },
                            {
                                name: 'Queue (Wont Play Until Command Loopsong Or Ls Is Entered To Disable Looping Current Song',
                                value: queuelist
                            }
                        )
                        .setTimestamp();
                    await message.reply({embeds: [queueListEmbed]})
                    queuelist = ``;
                }
                else{
                    await getQueueList(serverQueue)
                    const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(':thumbsup: Here Is The Queue')
                        .addFields(
                            {
                                name: 'Now Playing', 
                                value: serverQueue.songs[0].title
                            },
                            {
                                name: 'Requested By',
                                value: `<@${serverQueue.songs[0].message.author.id}>`
                            },
                            {
                                name: 'Queue',
                                value: queuelist
                            }
                        )
                        .setTimestamp();
                    await message.reply({embeds: [queueListEmbed]})
                    queuelist = ``;
                }
            }
            else{
                const nowPlayingQueueListEmbed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(':thumbsup: Here Is The Queue')
                    .addFields(
                        {
                            name: 'Now Playing', 
                            value: serverQueue.songs[0].title
                        },
                        {
                            name: 'Requested By',
                            value: `<@${serverQueue.songs[0].message.author.id}>`
                        },
                    )
                    .setTimestamp();
                message.reply({embeds: [nowPlayingQueueListEmbed]})
            }
        }   
        else{
            message.reply(':rofl: No Songs Currently In Queue :rofl:')
        }  
    }
}