//creates a list of the serverQueue with the title and who requested the song
//then sends that list inside of an embed message along with some other info

const { MessageEmbed } = require('discord.js');
const {deleteMsg, leave} = require('../modules');
let queuelist = ``;
var endqueuelist = 10;
var i = 0

const title = async (serverQueue) => {
    if(serverQueue.shuffle === true){
        if(serverQueue.loop === true){
            return 'The Looped Shuffed';
        }
        else{
            return 'The Shuffled';
        }
    }
    else if(serverQueue.loop === true && serverQueue.shuffle === false){
        return 'The Looped';
    }
    else{
        return 'The';
    }
}

async function queueListAdd(serverQueue){
    if(serverQueue.shuffle === true){
        for(i;
            i <= endqueuelist + 1;
            i++){
            if(serverQueue.shuffledSongs[i] && i <= endqueuelist){
                if(serverQueue.shuffledSongs[i] === serverQueue.shuffledSongs[0]){
                    queuelist += `\n****Now Playing****\n**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**\nRequested By: <@${serverQueue.currentsong[i].message.author.id}>\n***Duration*** ${serverQueue.currentsong[0].duration}\n`
                }
                else{
                    queuelist += `\n***${i}*** : **[${serverQueue.shuffledSongs[i].title}](${serverQueue.shuffledSongs[i].url})**\nRequested By: <@${serverQueue.shuffledSongs[i].message.author.id}> ***Duration*** ${serverQueue.shuffledSongs[i].duration}`   
                }
            } 
            else{
                break;
            }
        }
    }
    else{
        for(i;
            i <= endqueuelist + 1;
            i++){
            if(serverQueue.songs[i] && i <= endqueuelist){
                if(serverQueue.songs[i] === serverQueue.songs[0]){
                    queuelist += `\n****Now Playing****\n**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**\nRequested By: <@${serverQueue.currentsong[i].message.author.id}>\n***Duration*** ${serverQueue.currentsong[0].duration}\n`
                }
                else{
                    queuelist += `\n***${i}*** : **[${serverQueue.songs[i].title}](${serverQueue.songs[i].url})**\nRequested By: <@${serverQueue.songs[i].message.author.id}> ***Duration*** ${serverQueue.songs[i].duration}`   
                }
            }
            else{
                break;
            }
        }
    }
}

async function getQueueList(message, serverQueue, serverDisconnectIdle) {
    if(serverQueue.songs.length <= 10 && serverQueue.shuffledSongs.length <= 10){ 
        await queueListAdd(serverQueue);
        const queueListEmbed = new MessageEmbed()
            .setColor('LUMINOUS_VIVID_PINK')
            .setTitle(`:thumbsup: Here Is ${await title(serverQueue)} Queue`)
            .setDescription(`${queuelist}`)
        let msg = await message.channel.send({embeds: [queueListEmbed]});
        serverDisconnectIdle.queueMsgs.push(msg);
        queuelist = ``;
    }
    else{
        await queueListAdd(serverQueue);
        if(i === endqueuelist + 1 && endqueuelist === 10){
            const queueListEmbed = new MessageEmbed()
                .setColor('LUMINOUS_VIVID_PINK')
                .setTitle(`:thumbsup: Here Is ${await title(serverQueue)} Queue`)
                .setDescription(`${queuelist}`)
            let msg = await message.channel.send({embeds: [queueListEmbed]});
            serverDisconnectIdle.queueMsgs.push(msg);
            queuelist = ``;
            longQueueList(message, serverQueue, serverDisconnectIdle);
        }
        else if(endqueuelist > 10 && queuelist !== ``){
            const queueListEmbed = new MessageEmbed()
                .setColor('LUMINOUS_VIVID_PINK')
                .setDescription(`${queuelist}`)
            let msg = await message.channel.send({embeds: [queueListEmbed]});
            serverDisconnectIdle.queueMsgs.push(msg);
            queuelist = ``;
            longQueueList(message, serverQueue, serverDisconnectIdle);
        }
    }
}

function longQueueList(message, serverQueue, serverDisconnectIdle){
    if(endqueuelist < serverQueue.songs.length){
        endqueuelist = endqueuelist + 10;
        getQueueList(message, serverQueue, serverDisconnectIdle);
    }
}

module.exports = {
    name: 'queue',
    description: 'Shows queue to the discord text channel',
    async queuelist(message, serverQueue, serverDisconnectIdle){
        if(serverQueue !== undefined){
            if (serverDisconnectIdle.queueMsgs[0]) {
                serverDisconnectIdle.queueMsgs.forEach(msg => {
                    msg.delete();
                });
                serverDisconnectIdle.queueMsgs = [];
            }
            if(serverQueue.songs.length >= 2){
                queuelist = ``;
                endqueuelist = 10;
                i = 0
                getQueueList(message, serverQueue, serverDisconnectIdle);
            }
            else{
                const queueListEmbed = new MessageEmbed()
                    .setColor('LUMINOUS_VIVID_PINK')
                    .setTitle(':thumbsup: Here Is The Queue')
                    .addFields(
                        {
                            name: '****Now Playing****', 
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
                ;
            let msg = await message.channel.send({embeds: [queueListEmbed]});
            serverDisconnectIdle.queueMsgs.push(msg);
            queuelist = ``;
            } 
        }else{
            const noSongsEmbed = new MessageEmbed()
                .setColor('RED')
                .setDescription(`:rofl: No Songs Currently In Queue`)
            message.channel.send({embeds: [noSongsEmbed]})
            .then(msg => deleteMsg(msg, 30000, false));
        }  
    }
}
