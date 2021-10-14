//creates a list of the serverQueue with the title and who requested the song
//then sends that list inside of an embed message along with some other info
const { MessageEmbed } = require('discord.js');
let queuelist = ``;
async function getQueueList(serverQueue) {
    if(serverQueue.shuffle === false){
        for (i = 1; 
        i < serverQueue.songs.length; 
        i++){
        queuelist += `\n***${i}*** : **[${serverQueue.songs[i].title}](${serverQueue.songs[i].url})**\nRequested By: <@${serverQueue.songs[i].message.author.id}>`        
        } 
    }
    else{
        for (i = 1; 
        i < serverQueue.songs.length; 
        i++){
            queuelist += `\n***${i}*** : **[${serverQueue.shuffledSongs[i].title}](${serverQueue.shuffledSongs[i].url})**\nRequested By: <@${serverQueue.shuffledSongs[i].message.author.id}>`        
        }
    }
    
}

module.exports = {
    name: 'queue',
    description: 'Shows queue to the discord text channel',
    async execute(message, serverQueue){
        if(serverQueue !== undefined){
            if(serverQueue.shuffle === true){
                if(serverQueue.songs.length > 2 || serverQueue.songs.length === 2){
                    if(serverQueue.loopsong === true){
                        await getQueueList(serverQueue)
                        const shuffleLsQueueListEmbed = new MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle(':thumbsup: Here Is The Shuffled Queue')
                            .addFields(
                                {
                                    name: 'Looped Song', 
                                    value: `**[${serverQueue.shuffledSongs[0].title}](${serverQueue.songs[0].url})**`
                                },
                                {
                                    name: 'Requested By',
                                    value: `<@${serverQueue.shuffledSongs[0].message.author.id}>`
                                },
                                {
                                    name: 'Queue (Wont Play Until Command Loopsong Or Ls Is Entered To Disable Looping Current Song',
                                    value: queuelist
                                }
                            )
                            .setTimestamp();
                        await message.reply({embeds: [shuffleLsQueueListEmbed]})
                        queuelist = ``;
                    }
                    else{
                        await getQueueList(serverQueue)
                        const shuffleQueueListEmbed = new MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle(':thumbsup: Here Is The Shuffled Queue')
                            .addFields(
                                {
                                    name: 'Now Playing', 
                                    value: `**[${serverQueue.shuffledSongs[0].title}](${serverQueue.songs[0].url})**`
                                },
                                {
                                    name: 'Requested By',
                                    value: `<@${serverQueue.shuffledSongs[0].message.author.id}>`
                                },
                                {
                                    name: 'Queue',
                                    value: queuelist
                                }
                            )
                            .setTimestamp();
                        await message.reply({embeds: [shuffleQueueListEmbed]})
                        queuelist = ``;
                    }
                }
                else{
                    const oneSongQueueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(':thumbsup: Here Is The Queue')
                        .addFields(
                            {
                                name: 'Now Playing', 
                                value: `**[${serverQueue.shuffledSongs[0].title}](${serverQueue.songs[0].url})**`
                            },
                            {
                                name: 'Requested By',
                                value: `<@${serverQueue.shuffledSongs[0].message.author.id}>`
                            },
                        )
                        .setTimestamp();
                    message.reply({embeds: [oneSongQueueListEmbed]})
                }
            }
            else{
                if(serverQueue.songs.length > 2 || serverQueue.songs.length === 2){
                    if(serverQueue.loopsong === true){
                        await getQueueList(serverQueue)
                        const lsQueueListEmbed = new MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle(':thumbsup: Here Is The Queue')
                            .addFields(
                                {
                                    name: 'Looped Song', 
                                    value: `**[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})**`
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
                                    value: `**[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})**`
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
                    const oneSongQueueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(':thumbsup: Here Is The Queue')
                        .addFields(
                            {
                                name: 'Now Playing', 
                                value: `**[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})**`
                            },
                            {
                                name: 'Requested By',
                                value: `<@${serverQueue.songs[0].message.author.id}>`
                            },
                        )
                        .setTimestamp();
                    message.reply({embeds: [oneSongQueueListEmbed]})
                }
            }
        }   
        else{
            message.reply(':rofl: No Songs Currently In Queue :rofl:')
        }  
    }
}