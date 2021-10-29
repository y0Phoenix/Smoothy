//creates a list of the serverQueue with the title and who requested the song
//then sends that list inside of an embed message along with some other info

const { MessageEmbed } = require('discord.js');
let queuelist = ``;
var endqueuelist = 4;
var i = 1

async function getQueueList(message, serverQueue) {
    if(serverQueue.songs.length <= 4){
        if(serverQueue.shuffle === true && serverQueue.loop === false && serverQueue.loopsong === false){
            for(i;
                i < serverQueue.shuffledSongs.length;
                i++){
                    if(serverQueue.shuffledSongs[i]){
                        queuelist += `\n***${i}*** : **[${serverQueue.shuffledSongs[i].title}](${serverQueue.shuffledSongs[i].url})**\nRequested By: <@${serverQueue.shuffledSongs[i].message.author.id}> ***Duration*** ${serverQueue.shuffledSongs[i].duration}`
                    }
                    else{
                        break;
                    }
                }
            const queueListEmbed = new MessageEmbed()
                        .setColor('LUMINOUS_VIVID_PINK')
                        .setTitle(':thumbsup: Here Is The Shuffled Queue')
                        .addFields(
                            {
                                name: 'Now Playing', 
                                value: `**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**\n***Duration:*** ${serverQueue.currentsong[0].duration}`
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
                    await message.channel.send({embeds: [queueListEmbed]})
                    queuelist = ``;
        }
        else if(serverQueue.shuffle === false && serverQueue.loop === true && serverQueue.loopsong === false){
            for(i;
                i < serverQueue.songs.length;
                i++){
                    if(serverQueue.songs[i]){
                        queuelist += `\n***${i}*** : **[${serverQueue.songs[i].title}](${serverQueue.songs[i].url})**\nRequested By: <@${serverQueue.songs[i].message.author.id}> ***Duration*** ${serverQueue.songs[i].duration}`
                    }
                    else{
                        break;
                    }
                }
                const queueListEmbed = new MessageEmbed()
                        .setColor('LUMINOUS_VIVID_PINK')
                        .setTitle(':thumbsup: Here Is The Looped Queue')
                        .addFields(
                            {
                                name: 'Now Playing', 
                                value: `**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**\n***Duration:*** ${serverQueue.currentsong[0].duration}`
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
                    await message.channel.send({embeds: [queueListEmbed]})
                    queuelist = ``;
        }
        else if (serverQueue.shuffle === true && serverQueue.loop === true && serverQueue.loopsong === false){
            for(i;
                i < serverQueue.shuffledSongs.length;
                i++){
                    if(serverQueue.shuffledSongs[i]){
                            queuelist += `\n***${i}*** : **[${serverQueue.shuffledSongs[i].title}](${serverQueue.shuffledSongs[i].url})**\nRequested By: <@${serverQueue.shuffledSongs[i].message.author.id}> ***Duration*** ${serverQueue.shuffledSongs[i].duration}`
                    }                    
                    else{
                        break;
                    }
                }
            const queueListEmbed = new MessageEmbed()
                        .setColor('LUMINOUS_VIVID_PINK')
                        .setTitle(':thumbsup: Here Is The Looped Shuffled Queue')
                        .addFields(
                            {
                                name: 'Now Playing', 
                                value: `**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**\n***Duration:*** ${serverQueue.currentsong[0].duration}`
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
                    await message.channel.send({embeds: [queueListEmbed]})
                    queuelist = ``;
        }
        else if(serverQueue.shuffle === false && serverQueue.loop === false && serverQueue.loopsong === true){
            for(i;
                i < serverQueue.songs.length;
                i++){
                    if(serverQueue.songs[i]){
                        queuelist += `\n***${i}*** : **[${serverQueue.songs[i].title}](${serverQueue.songs[i].url})**\nRequested By: <@${serverQueue.songs[i].message.author.id}> ***Duration*** ${serverQueue.songs[i].duration}`                  
                    }
                    else{
                        break;
                    }
                }
                const queueListEmbed = new MessageEmbed()
                        .setColor('LUMINOUS_VIVID_PINK')
                        .setTitle(':thumbsup: Here Is The Queue')
                        .addFields(
                            {
                                name: 'Looped Song', 
                                value: `**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**\n***Duration:*** ${serverQueue.currentsong[0].duration}`
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
                    await message.channel.send({embeds: [queueListEmbed]})
                    queuelist = ``;
        }
        else if(serverQueue.shuffle === true && serverQueue.loop === false && serverQueue.loopsong === true){
            for(i;
                i < serverQueue.shuffledSongs.length;
                i++){
                    if(serverQueue.shuffledSongs[i]){
                        queuelist += `\n***${i}*** : **[${serverQueue.shuffledSongs[i].title}](${serverQueue.shuffledSongs[i].url})**\nRequested By: <@${serverQueue.shuffledSongs[i].message.author.id}> ***Duration*** ${serverQueue.shuffledSongs[i].duration}`
                    }
                    else{
                        break;
                    }
                }
            const queueListEmbed = new MessageEmbed()
                        .setColor('LUMINOUS_VIVID_PINK')
                        .setTitle(':thumbsup: Here Is The Shuffled Queue')
                        .addFields(
                            {
                                name: 'Looped Song', 
                                value: `**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**\n***Duration:*** ${serverQueue.currentsong[0].duration}`
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
                    await message.channel.send({embeds: [queueListEmbed]})
                    queuelist = ``;
        }
        else{
            for(i;
                i < serverQueue.songs.length + 1;
                i++){
                    if(i < serverQueue.songs.length){
                        if(serverQueue.songs[i]){
                            queuelist += `\n***${i}*** : **[${serverQueue.songs[i].title}](${serverQueue.songs[i].url})**\nRequested By: <@${serverQueue.songs[i].message.author.id}> ***Duration*** ${serverQueue.songs[i].duration}`
                        }                               
                        else{
                            endqueuelist = 4;
                            i = 1;
                            queuelist = ``;
                            break;
                        } 
                    }
                    else{
                        const queueListEmbed = new MessageEmbed()
                            .setColor('LUMINOUS_VIVID_PINK')
                            .setTitle(':thumbsup: Here Is The Queue')
                            .addFields(
                                {
                                    name: 'Now Playing', 
                                    value: `**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**\n***Duration:*** ${serverQueue.currentsong[0].duration}`
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
                        await message.channel.send({embeds: [queueListEmbed]})
                        endqueuelist = 4;
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
                if(i === endqueuelist && endqueuelist < serverQueue.shuffledSongs.length && i < 5){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('LUMINOUS_VIVID_PINK')
                        .setTitle(':thumbsup: Here Is The Shuffled Queue')
                        .addFields(
                            {
                                name: 'Now Playing', 
                                value: `**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**\n***Duration:*** ${serverQueue.currentsong[0].duration}`
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
                    await message.channel.send({embeds: [queueListEmbed]})
                    queuelist = ``;
                    longQueueList(message, serverQueue);
                    break;
                }else if (i === endqueuelist && endqueuelist < serverQueue.shuffledSongs.length && i > 5){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('LUMINOUS_VIVID_PINK')
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
                else if(i === serverQueue.shuffledSongs.length && endqueuelist > 4){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('LUMINOUS_VIVID_PINK')
                        .addFields(
                            {
                                name: 'Queue',
                                value: queuelist
                            }
                        )
                        .setTimestamp();
                    await message.channel.send({embeds: [queueListEmbed]})
                    endqueuelist = 4;
                    i = 1;
                    queuelist = ``;
                    break;
                }

                if(serverQueue.shuffledSongs[i]){
                    queuelist += `\n***${i}*** : **[${serverQueue.shuffledSongs[i].title}](${serverQueue.shuffledSongs[i].url})**\nRequested By: <@${serverQueue.shuffledSongs[i].message.author.id}> ***Duration*** ${serverQueue.shuffledSongs[i].duration}`
                }
                else{
                    endqueuelist = 4;
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
                if(i === endqueuelist && endqueuelist < serverQueue.songs.length && i < 5){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('LUMINOUS_VIVID_PINK')
                        .setTitle(':thumbsup: Here Is The Looped Queue')
                        .addFields(
                            {
                                name: 'Now Playing', 
                                value: `**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**\n***Duration:*** ${serverQueue.currentsong[0].duration}`
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
                    await message.channel.send({embeds: [queueListEmbed]})
                    queuelist = ``;
                    longQueueList(message, serverQueue);
                    break;
                }else if (i === endqueuelist && endqueuelist < serverQueue.songs.length && i > 5){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('LUMINOUS_VIVID_PINK')
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
                else if(i === serverQueue.songs.length && endqueuelist > 4){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('LUMINOUS_VIVID_PINK')
                        .addFields(
                            {
                                name: 'Queue',
                                value: queuelist
                            }
                        )
                        .setTimestamp();
                    await message.channel.send({embeds: [queueListEmbed]})
                    endqueuelist = 4;
                    i = 1;
                    queuelist = ``;
                    break;
                }

                if(serverQueue.songs[i]){
                    queuelist += `\n***${i}*** : **[${serverQueue.songs[i].title}](${serverQueue.songs[i].url})**\nRequested By: <@${serverQueue.songs[i].message.author.id}> ***Duration*** ${serverQueue.songs[i].duration}`
                }          
                else{
                    endqueuelist = 4;
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
                if(i === endqueuelist && endqueuelist < serverQueue.shuffledSongs.length && i < 5){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('LUMINOUS_VIVID_PINK')
                        .setTitle(':thumbsup: Here Is The Looped Shuffled Queue')
                        .addFields(
                            {
                                name: 'Now Playing', 
                                value: `**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**\n***Duration:*** ${serverQueue.currentsong[0].duration}`
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
                    await message.channel.send({embeds: [queueListEmbed]})
                    queuelist = ``;
                    longQueueList(message, serverQueue);
                    break;
                }else if (i === endqueuelist && endqueuelist < serverQueue.shuffledSongs.length && i > 5){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('LUMINOUS_VIVID_PINK')
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
                else if(i === serverQueue.shuffledSongs.length && endqueuelist > 4){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('LUMINOUS_VIVID_PINK')
                        .addFields(
                            {
                                name: 'Queue',
                                value: queuelist
                            }
                        )
                        .setTimestamp();
                    await message.channel.send({embeds: [queueListEmbed]})
                    endqueuelist = 4;
                    i = 1;
                    queuelist = ``;
                    break;
                }

                if(serverQueue.shuffledSongs[i]){
                    queuelist += `\n***${i}*** : **[${serverQueue.shuffledSongs[i].title}](${serverQueue.shuffledSongs[i].url})**\nRequested By: <@${serverQueue.shuffledSongs[i].message.author.id}> ***Duration*** ${serverQueue.shuffledSongs[i].duration}`
            }          
                else{
                    endqueuelist = 4;
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
                if(i === endqueuelist && endqueuelist < serverQueue.songs.length && i < 5){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('LUMINOUS_VIVID_PINK')
                        .setTitle(':thumbsup: Here Is The Queue')
                        .addFields(
                            {
                                name: 'Looped Song', 
                                value: `**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**\n***Duration:*** ${serverQueue.currentsong[0].duration}`
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
                    await message.channel.send({embeds: [queueListEmbed]})
                    queuelist = ``;
                    longQueueList(message, serverQueue);
                    break;
                }else if (i === endqueuelist && endqueuelist < serverQueue.songs.length && i > 5){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('LUMINOUS_VIVID_PINK')
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
                else if(i === serverQueue.songs.length && endqueuelist > 4){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('LUMINOUS_VIVID_PINK')
                        .addFields(
                            {
                                name: 'Queue',
                                value: queuelist
                            }
                        )
                        .setTimestamp();
                    await message.channel.send({embeds: [queueListEmbed]})
                    endqueuelist = 4;
                    i = 1;
                    queuelist = ``;
                    break;
                }

                if(serverQueue.songs[i]){
                    queuelist += `\n***${i}*** : **[${serverQueue.songs[i].title}](${serverQueue.songs[i].url})**\nRequested By: <@${serverQueue.songs[i].message.author.id}> ***Duration*** ${serverQueue.songs[i].duration}`
                }         
                else{
                    endqueuelist = 4;
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
                if(i === endqueuelist && endqueuelist < serverQueue.shuffledSongs.length && i < 5){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('LUMINOUS_VIVID_PINK')
                        .setTitle(':thumbsup: Here Is The Shuffled Queue')
                        .addFields(
                            {
                                name: 'Looped Song', 
                                value: `**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**\n***Duration:*** ${serverQueue.currentsong[0].duration}`
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
                    await message.channel.send({embeds: [queueListEmbed]})
                    queuelist = ``;
                    longQueueList(message, serverQueue);
                    break;
                }else if (i === endqueuelist && endqueuelist < serverQueue.shuffledSongs.length && i > 5){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('LUMINOUS_VIVID_PINK')
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
                else if(i === serverQueue.shuffledSongs.length && endqueuelist > 4){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('LUMINOUS_VIVID_PINK')
                        .addFields(
                            {
                                name: 'Queue (Wont Play Until -ls Or -loopsong Is Entered)',
                                value: queuelist
                            }
                        )
                        .setTimestamp();
                    await message.channel.send({embeds: [queueListEmbed]})
                    endqueuelist = 4;
                    i = 1;
                    queuelist = ``;
                    break;
                }

                if(serverQueue.shuffledSongs[i]){
                    queuelist += `\n***${i}*** : **[${serverQueue.shuffledSongs[i].title}](${serverQueue.shuffledSongs[i].url})**\nRequested By: <@${serverQueue.shuffledSongs[i].message.author.id}> ***Duration*** ${serverQueue.shuffledSongs[i].duration}`
                }
                else{
                    endqueuelist = 4;
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
                if(i === endqueuelist && endqueuelist < serverQueue.songs.length && i < 5){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('LUMINOUS_VIVID_PINK')
                        .setTitle(':thumbsup: Here Is The Queue')
                        .addField('Now Playing', `**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**\n***Duration:*** ${serverQueue.currentsong[0].duration}`
                        )
                        .addField(
                             'Requested By', `<@${serverQueue.songs[0].message.author.id}>`
                        )
                        .addField(
                             'Queue', `${queuelist}`
                        )
                        .setTimestamp();
                    await message.channel.send({embeds: [queueListEmbed]})
                    queuelist = ``;
                    longQueueList(message, serverQueue);
                    break;
                }else if (i === endqueuelist && endqueuelist < serverQueue.songs.length && i > 5){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('LUMINOUS_VIVID_PINK')
                        .addField('Queue', queuelist
                        )
                        .setTimestamp();
                    await message.channel.send({embeds: [queueListEmbed]})
                    queuelist = ``;
                    longQueueList(message, serverQueue);
                    break;
                }
                else if(i === serverQueue.songs.length && endqueuelist > 4){
                    const queueListEmbed = new MessageEmbed()
                        .setColor('LUMINOUS_VIVID_PINK')
                        .addField('Queue', queuelist
                        )
                        .setTimestamp();
                    await message.channel.send({embeds: [queueListEmbed]})
                    endqueuelist = 4;
                    i = 1;
                    queuelist = ``;
                    break;
                }
                
                if(serverQueue.songs[i]){
                    queuelist += `\n***${i}*** : **[${serverQueue.songs[i].title}](${serverQueue.songs[i].url})**\nRequested By: <@${serverQueue.songs[i].message.author.id}> ***Duration*** ${serverQueue.songs[i].duration}`
                }
                else{
                    endqueuelist = 4;
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
        endqueuelist = endqueuelist + 4;
        getQueueList(message, serverQueue);
    }else if(i === serverQueue.songs.length){
        endqueuelist = 4;
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
                    const queueListEmbed = new MessageEmbed()
                        .setColor('LUMINOUS_VIVID_PINK')
                        .setTitle(':thumbsup: Here Is The Queue')
                        .addFields(
                            {
                                name: 'Now Playing', 
                                value: `**[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})**\n***Duration:*** ${serverQueue.songs[0].duration}`
                            },
                            {
                                name: 'Requested By',
                                value: `<@${serverQueue.songs[0].message.author.id}>`
                            },
                            {
                                name: 'Queue',
                                value: `No Other Songs`
                            }
                        )
                        .setTimestamp()
                    ;
                await message.channel.send({embeds: [queueListEmbed]})
                queuelist = ``;
                } 
        }else{
            const noSongsEmbed = new MessageEmbed()
                .setColor('RED')
                .setDescription(`:rofl: No Songs Currently In Queue`)
            message.channel.send({embeds: [noSongsEmbed]});
        }  
    }
}
