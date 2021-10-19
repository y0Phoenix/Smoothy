//creates a list of the serverQueue with the title and who requested the song
//then sends that list inside of an embed message along with some other info

const { MessageEmbed } = require('discord.js');
const { shuffle } = require('./shuffle');
let queuelist = ``;
var endqueuelist = 7;
var i = 1

async function getQueueList(message, serverQueue) {
    if(serverQueue.songs.length <= 7){
        if(serverQueue.shuffle === true && serverQueue.loop === false && serverQueue.loopsong === false){
            for(i;
                i < serverQueue.shuffledSongs.length;
                i++){
                    if(serverQueue.shuffledSongs[i]){
                        queuelist += `\n***${i}*** : **[${serverQueue.shuffledSongs[i].title}](${serverQueue.shuffledSongs[i].url})**\nRequested By: <@${serverQueue.shuffledSongs[i].message.author.id}>`
                    }
                    else{
                        break;
                    }
                }
            const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(':thumbsup: Here Is The Shuffled Queue')
                        .addFields(
                            {
                                name: 'Now Playing', 
                                value: `**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**`
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
                    await message.reply({embeds: [queueListEmbed]})
                    queuelist = ``;
        }
        else if(serverQueue.shuffle === false && serverQueue.loop === true && serverQueue.loopsong === false){
            for(i;
                i < serverQueue.songs.length;
                i++){
                    if(serverQueue.songs[i]){
                        queuelist += `\n***${i}*** : **[${serverQueue.songs[i].title}](${serverQueue.songs[i].url})**\nRequested By: <@${serverQueue.songs[i].message.author.id}>`
                    }
                    else{
                        break;
                    }
                }
                const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(':thumbsup: Here Is The Looped Queue')
                        .addFields(
                            {
                                name: 'Now Playing', 
                                value: `**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**`
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
        else if (serverQueue.shuffle === true && serverQueue.loop === true && serverQueue.loopsong === false){
            for(i;
                i < serverQueue.shuffledSongs.length;
                i++){
                    if(serverQueue.shuffledSongs[i]){
                        queuelist += `\n***${i}*** : **[${serverQueue.shuffledSongs[i].title}](${serverQueue.shuffledSongs[i].url})**\nRequested By: <@${serverQueue.shuffledSongs[i].message.author.id}>`
                    }
                    else{
                        break;
                    }
                }
            const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(':thumbsup: Here Is The Looped Shuffled Queue')
                        .addFields(
                            {
                                name: 'Now Playing', 
                                value: `**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**`
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
                    await message.reply({embeds: [queueListEmbed]})
                    queuelist = ``;
        }
        else if(serverQueue.shuffle === false && serverQueue.loop === false && serverQueue.loopsong === true){
            for(i;
                i < serverQueue.songs.length;
                i++){
                    if(serverQueue.songs[i]){
                        queuelist += `\n***${i}*** : **[${serverQueue.shuffledSongs[i].title}](${serverQueue.shuffledSongs[i].url})**\nRequested By: <@${serverQueue.shuffledSongs[i].message.author.id}>`
                    }
                    else{
                        break;
                    }
                }
                const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(':thumbsup: Here Is The Queue')
                        .addFields(
                            {
                                name: 'Looped Song', 
                                value: `**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**`
                            },
                            {
                                name: 'Requested By',
                                value: `<@${serverQueue.shuffledSongs[0].message.author.id}>`
                            },
                            {
                                name: 'Queue (Wont Play Until -ls or -loopsong is entered',
                                value: queuelist
                            }
                        )
                        .setTimestamp();
                    await message.reply({embeds: [queueListEmbed]})
                    queuelist = ``;
        }
        else if(serverQueue.shuffle === true && serverQueue.loop === false && serverQueue.loopsong === true){
            for(i;
                i < serverQueue.shuffledSongs.length;
                i++){
                    if(serverQueue.shuffledSongs[i]){
                        queuelist += `\n***${i}*** : **[${serverQueue.shuffledSongs[i].title}](${serverQueue.shuffledSongs[i].url})**\nRequested By: <@${serverQueue.shuffledSongs[i].message.author.id}>`
                    }
                    else{
                        break;
                    }
                }
            const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(':thumbsup: Here Is The Shuffled Queue')
                        .addFields(
                            {
                                name: 'Looped Song', 
                                value: `**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**`
                            },
                            {
                                name: 'Requested By',
                                value: `<@${serverQueue.shuffledSongs[0].message.author.id}>`
                            },
                            {
                                name: 'Queue (Wont Play Until -ls Or -loopsong Is Entered)',
                                value: queuelist
                            }
                        )
                        .setTimestamp();
                    await message.reply({embeds: [queueListEmbed]})
                    queuelist = ``;
        }
        else{
            for(i;
                i < serverQueue.songs.length + 1;
                i++){
                    if(i < serverQueue.songs.length){
                        if(serverQueue.songs[i]){
                            queuelist += `\n***${i}*** : **[${serverQueue.songs[i].title}](${serverQueue.songs[i].url})**\nRequested By: <@${serverQueue.songs[i].message.author.id}>`
                        }
                        else{
                            endqueuelist = 7;
                            i = 1;
                            queuelist = ``;
                            break;
                        } 
                    }
                    else{
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
                        endqueuelist = 7;
                        i = 1;
                        queuelist = ``;
                        break;
                    }
                }
        }
    }
    else{
        if(serverQueue.shuffle === true && serverQueue.loop === false && serverQueue.loopsong === false){
            for (i; 
                i < endqueuelist + 1; 
                i++){
                if(i === endqueuelist && endqueuelist < serverQueue.shuffledSongs.length && i < 8){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(':thumbsup: Here Is The Shuffled Queue')
                        .addFields(
                            {
                                name: 'Now Playing', 
                                value: `**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**`
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
                    await message.reply({embeds: [queueListEmbed]})
                    queuelist = ``;
                    longQueueList(message, serverQueue);
                    break;
                }else if (i === endqueuelist && endqueuelist < serverQueue.shuffledSongs.length && i > 8){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .addFields(
                            {
                                name: 'Queue',
                                value: queuelist
                            }
                        )
                        .setTimestamp();
                    await message.channel.send({embeds: [queueListEmbed]})
                    queuelist = ``;
                    longQueueList(message, serverQueue);
                    break;
                }
                else if(i === serverQueue.shuffledSongs.length && endqueuelist > 7){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .addFields(
                            {
                                name: 'Queue',
                                value: queuelist
                            }
                        )
                        .setTimestamp();
                    await message.channel.send({embeds: [queueListEmbed]})
                    endqueuelist = 7;
                    i = 1;
                    queuelist = ``;
                    break;
                }

                if(serverQueue.shuffledSongs[i]){
                    queuelist += `\n***${i}*** : **[${serverQueue.shuffledSongs[i].title}](${serverQueue.shuffledSongs[i].url})**\nRequested By: <@${serverQueue.shuffledSongs[i].message.author.id}>`
                }
                else{
                    endqueuelist = 7;
                    i = 1;
                    queuelist = ``;
                    break;
                } 
            }
        }
        else if(serverQueue.shuffle === false && serverQueue.loop === true && serverQueue.loopsong === false){
            for (i; 
                i < endqueuelist + 1; 
                i++){
                if(i === endqueuelist && endqueuelist < serverQueue.songs.length && i < 8){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(':thumbsup: Here Is The Looped Queue')
                        .addFields(
                            {
                                name: 'Now Playing', 
                                value: `**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**`
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
                    longQueueList(message, serverQueue);
                    break;
                }else if (i === endqueuelist && endqueuelist < serverQueue.songs.length && i > 8){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .addFields(
                            {
                                name: 'Queue',
                                value: queuelist
                            }
                        )
                        .setTimestamp();
                    await message.channel.send({embeds: [queueListEmbed]})
                    queuelist = ``;
                    longQueueList(message, serverQueue);
                    break;
                }
                else if(i === serverQueue.songs.length && endqueuelist > 7){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .addFields(
                            {
                                name: 'Queue',
                                value: queuelist
                            }
                        )
                        .setTimestamp();
                    await message.channel.send({embeds: [queueListEmbed]})
                    endqueuelist = 7;
                    i = 1;
                    queuelist = ``;
                    break;
                }

                if(serverQueue.songs[i]){
                    queuelist += `\n***${i}*** : **[${serverQueue.songs[i].title}](${serverQueue.songs[i].url})**\nRequested By: <@${serverQueue.songs[i].message.author.id}>`
                }
                else{
                    endqueuelist = 7;
                    i = 1;
                    queuelist = ``;
                    break;
                } 
            }
        }
        else if (serverQueue.shuffle === true && serverQueue.loop === true && serverQueue.loopsong === false){
            for (i; 
                i < endqueuelist + 1; 
                i++){
                if(i === endqueuelist && endqueuelist < serverQueue.shuffledSongs.length && i < 8){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(':thumbsup: Here Is The Looped Shuffled Queue')
                        .addFields(
                            {
                                name: 'Now Playing', 
                                value: `**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**`
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
                    await message.reply({embeds: [queueListEmbed]})
                    queuelist = ``;
                    longQueueList(message, serverQueue);
                    break;
                }else if (i === endqueuelist && endqueuelist < serverQueue.shuffledSongs.length && i > 8){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .addFields(
                            {
                                name: 'Queue',
                                value: queuelist
                            }
                        )
                        .setTimestamp();
                    await message.channel.send({embeds: [queueListEmbed]})
                    queuelist = ``;
                    longQueueList(message, serverQueue);
                    break;
                }
                else if(i === serverQueue.shuffledSongs.length && endqueuelist > 7){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .addFields(
                            {
                                name: 'Queue',
                                value: queuelist
                            }
                        )
                        .setTimestamp();
                    await message.channel.send({embeds: [queueListEmbed]})
                    endqueuelist = 7;
                    i = 1;
                    queuelist = ``;
                    break;
                }

                if(serverQueue.shuffledSongs[i]){
                    queuelist += `\n***${i}*** : **[${serverQueue.shuffledSongs[i].title}](${serverQueue.shuffledSongs[i].url})**\nRequested By: <@${serverQueue.shuffledSongs[i].message.author.id}>`
                }
                else{
                    endqueuelist = 7;
                    i = 1;
                    queuelist = ``;
                    break;
                } 
            } 
        }
        else if(serverQueue.shuffle === false && serverQueue.loop === false && serverQueue.loopsong === true){
            for (i; 
                i < endqueuelist + 1; 
                i++){
                if(i === endqueuelist && endqueuelist < serverQueue.songs.length && i < 8){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(':thumbsup: Here Is The Queue')
                        .addFields(
                            {
                                name: 'Looped Song', 
                                value: `**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**`
                            },
                            {
                                name: 'Requested By',
                                value: `<@${serverQueue.songs[0].message.author.id}>`
                            },
                            {
                                name: 'Queue (Wont Play Until -ls or -loopsong is entered)',
                                value: queuelist
                            }
                        )
                        .setTimestamp();
                    await message.reply({embeds: [queueListEmbed]})
                    queuelist = ``;
                    longQueueList(message, serverQueue);
                    break;
                }else if (i === endqueuelist && endqueuelist < serverQueue.songs.length && i > 8){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .addFields(
                            {
                                name: 'Queue',
                                value: queuelist
                            }
                        )
                        .setTimestamp();
                    await message.channel.send({embeds: [queueListEmbed]})
                    queuelist = ``;
                    longQueueList(message, serverQueue);
                    break;
                }
                else if(i === serverQueue.songs.length && endqueuelist > 7){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .addFields(
                            {
                                name: 'Queue',
                                value: queuelist
                            }
                        )
                        .setTimestamp();
                    await message.channel.send({embeds: [queueListEmbed]})
                    endqueuelist = 7;
                    i = 1;
                    queuelist = ``;
                    break;
                }

                if(serverQueue.songs[i]){
                    queuelist += `\n***${i}*** : **[${serverQueue.songs[i].title}](${serverQueue.songs[i].url})**\nRequested By: <@${serverQueue.songs[i].message.author.id}>`
                }
                else{
                    endqueuelist = 7;
                    i = 1;
                    queuelist = ``;
                    break;
                } 
            }
        }
        else if(serverQueue.shuffle === true && serverQueue.loop === false && serverQueue.loopsong === true){
            for (i; 
                i < endqueuelist + 1; 
                i++){
                if(i === endqueuelist && endqueuelist < serverQueue.shuffledSongs.length && i < 8){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(':thumbsup: Here Is The Shuffled Queue')
                        .addFields(
                            {
                                name: 'Looped Song', 
                                value: `**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**`
                            },
                            {
                                name: 'Requested By',
                                value: `<@${serverQueue.shuffledSongs[0].message.author.id}>`
                            },
                            {
                                name: 'Queue (Wont Play Until -ls Or -loopsong Is Entered)',
                                value: queuelist
                            }
                        )
                        .setTimestamp();
                    await message.reply({embeds: [queueListEmbed]})
                    queuelist = ``;
                    longQueueList(message, serverQueue);
                    break;
                }else if (i === endqueuelist && endqueuelist < serverQueue.shuffledSongs.length && i > 8){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .addFields(
                            {
                                name: 'Queue (Wont Play Until -ls Or -loopsong Is Entered)',
                                value: queuelist
                            }
                        )
                        .setTimestamp();
                    await message.channel.send({embeds: [queueListEmbed]})
                    queuelist = ``;
                    longQueueList(message, serverQueue);
                    break;
                }
                else if(i === serverQueue.shuffledSongs.length && endqueuelist > 7){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .addFields(
                            {
                                name: 'Queue (Wont Play Until -ls Or -loopsong Is Entered)',
                                value: queuelist
                            }
                        )
                        .setTimestamp();
                    await message.channel.send({embeds: [queueListEmbed]})
                    endqueuelist = 7;
                    i = 1;
                    queuelist = ``;
                    break;
                }

                if(serverQueue.shuffledSongs[i]){
                    queuelist += `\n***${i}*** : **[${serverQueue.shuffledSongs[i].title}](${serverQueue.shuffledSongs[i].url})**\nRequested By: <@${serverQueue.shuffledSongs[i].message.author.id}>`
                }
                else{
                    endqueuelist = 7;
                    i = 1;
                    queuelist = ``;
                    break;
                } 
            } 
        }
        else{
            for (i; 
                i < endqueuelist + 1; 
                i++){
                if(i === endqueuelist && endqueuelist < serverQueue.songs.length && i < 8){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(':thumbsup: Here Is The Queue')
                        .addFields(
                            {
                                name: 'Now Playing', 
                                value: `**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**`
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
                    longQueueList(message, serverQueue);
                    break;
                }else if (i === endqueuelist && endqueuelist < serverQueue.songs.length && i > 8){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .addFields(
                            {
                                name: 'Queue',
                                value: queuelist
                            }
                        )
                        .setTimestamp();
                    await message.channel.send({embeds: [queueListEmbed]})
                    queuelist = ``;
                    longQueueList(message, serverQueue);
                    break;
                }
                else if(i === serverQueue.songs.length && endqueuelist > 7){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .addFields(
                            {
                                name: 'Queue',
                                value: queuelist
                            }
                        )
                        .setTimestamp();
                    await message.channel.send({embeds: [queueListEmbed]})
                    endqueuelist = 7;
                    i = 1;
                    queuelist = ``;
                    break;
                }
                
                if(serverQueue.songs[i]){
                    queuelist += `\n***${i}*** : **[${serverQueue.songs[i].title}](${serverQueue.songs[i].url})**\nRequested By: <@${serverQueue.songs[i].message.author.id}>`
                }
                else{
                    endqueuelist = 7;
                    i = 1;
                    queuelist = ``;
                    break;
                } 
            }
        }
    }
}

async function longQueueList(message, serverQueue){
    if(endqueuelist < serverQueue.songs.length){
        endqueuelist = endqueuelist + 7;
        getQueueList(message, serverQueue);
    }else if(i === serverQueue.songs.length){
        endqueuelist = 7;
        i = 1;
        queuelist = ``;
    }
}

module.exports = {
    name: 'queue',
    description: 'Shows queue to the discord text channel',
    async execute(message, serverQueue){
        if(serverQueue !== undefined){
                if(serverQueue.songs.length >= 2){
                i = 1;
                getQueueList(message, serverQueue);
                }
                else{
                    await getQueueList(message, serverQueue);
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
        }else{
            message.reply(':rofl: No Songs Currently In Queue :rofl:');
        }  
    }
}
