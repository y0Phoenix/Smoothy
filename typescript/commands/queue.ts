//creates a list of the serverQueue with the title and who requested the song
//then sends that list inside of an embed message along with some other info
// TODO add the queuelist endqueulist and i global variables to the Queue class for security incase two queue request come in at the same time
// TODO implement checking for the message being sent to ensure the description is less than 4096 characters

import { MessageEmbed, Message } from 'discord.js';
import { Idle } from '../Classes/Idle';
import Queue from '../Classes/Queue';
import getMaps from '../maps';
import {deleteMsg, leave, writeGlobal} from '../modules/modules';
/**
 * @param  {Queue} serverQueue the current serves queue
 * @description chacks multiple conditions and return a string that matches a specific condition
 * @returns {string}
 */

const title = async (serverQueue: Queue) => {
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
/**
 * @param  {Queue} serverQueue the current servers Queue
 * @description adds onto the queuelist string to create one big queue
 */
async function queueListAdd(serverQueue: Queue){
    if(serverQueue.shuffle === true){
        for(serverQueue.queue.i;
            serverQueue.queue.i <= serverQueue.queue.endQueueList + 1;
            serverQueue.queue.i++){
            const i = serverQueue.queue.i;
            const endQueueList = serverQueue.queue.endQueueList;
            if(serverQueue.shuffledSongs[i] && i <= endQueueList){
                if(serverQueue.shuffledSongs[i] === serverQueue.shuffledSongs[0]){
                    serverQueue.queue.queueList += `\n****Now Playing****\n**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**\nRequested By: <@${serverQueue.currentsong[0].message.author.id}>\n***Duration*** ${serverQueue.currentsong[0].duration}\n`
                }
                else{
                    serverQueue.queue.queueList += `\n***${i}*** : **[${serverQueue.shuffledSongs[i].title}](${serverQueue.shuffledSongs[i].url})**\nRequested By: <@${serverQueue.shuffledSongs[i].message.author.id}> ***Duration*** ${serverQueue.shuffledSongs[i].duration}`   
                }
            } 
            else{
                break;
            }
        }
    }
    else{
        for(serverQueue.queue.i;
            serverQueue.queue.i <= serverQueue.queue.endQueueList + 1;
            serverQueue.queue.i++){
            const i = serverQueue.queue.i;
            const endQueueList = serverQueue.queue.endQueueList;
            if(serverQueue.songs[i] && i <= endQueueList){
                if(serverQueue.songs[i] === serverQueue.songs[0]){
                    serverQueue.queue.queueList += `\n****Now Playing****\n**[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})**\nRequested By: <@${serverQueue.currentsong[0].message.author.id}>\n***Duration*** ${serverQueue.currentsong[0].duration}\n`
                }
                else{
                    serverQueue.queue.queueList += `\n***${i}*** : **[${serverQueue.songs[i].title}](${serverQueue.songs[i].url})**\nRequested By: <@${serverQueue.songs[i].message.author.id}> ***Duration*** ${serverQueue.songs[i].duration}`   
                }
            }
            else{
                break;
            }
        }
    }
}
/**
 * @param  {} message the users message
 * @param  {} serverQueue the current servers Queue
 * @param  {} serverDisconnectIdle the current servers Idle
 * @description checks conditions and send a message embed with the queuelist global var inside
 */
async function getQueueList(message: Message, serverQueue: Queue, serverDisconnectIdle: Idle) {
    if(serverQueue.songs.length <= 10 && serverQueue.shuffledSongs.length <= 10){ 
        await queueListAdd(serverQueue);
        const queueListEmbed = new MessageEmbed()
            .setColor('LUMINOUS_VIVID_PINK')
            .setTitle(`:thumbsup: Here Is ${await title(serverQueue)} Queue`)
            .setDescription(`${serverQueue.queue.queueList}`)
        ;
        const msg = await message.channel.send({embeds: [queueListEmbed]});
        serverDisconnectIdle.queueMsgs.push(msg);
        serverQueue.queue.queueList = ``;
    }
    else{
        await queueListAdd(serverQueue);
        if(serverQueue.queue.i === serverQueue.queue.endQueueList + 1 && serverQueue.queue.endQueueList === 10){
            const queueListEmbed = new MessageEmbed()
                .setColor('LUMINOUS_VIVID_PINK')
                .setTitle(`:thumbsup: Here Is ${await title(serverQueue)} Queue`)
                .setDescription(`${serverQueue.queue.queueList}`)
            ;
            const msg = await message.channel.send({embeds: [queueListEmbed]});
            serverDisconnectIdle.queueMsgs.push(msg);
            serverQueue.queue.queueList = ``;
            longQueueList(message, serverQueue, serverDisconnectIdle);
        }
        else if(serverQueue.queue.endQueueList > 10 && serverQueue.queue.queueList !== ``){
            const queueListEmbed = new MessageEmbed()
                .setColor('LUMINOUS_VIVID_PINK')
                .setDescription(`${serverQueue.queue.queueList}`)
            ;
            const msg = await message.channel.send({embeds: [queueListEmbed]});
            serverDisconnectIdle.queueMsgs.push(msg);
            serverQueue.queue.queueList = ``;
            longQueueList(message, serverQueue, serverDisconnectIdle);
        }
    }
    writeGlobal('update dci', serverDisconnectIdle, message.guildId);
}
/**
 * @param  {} message the users message
 * @param  {} serverQueue the current servers Queue
 * @param  {} serverDisconnectIdle the current servers Idles
 * @description check if the endqueuelist gloabl var is less than the songs length inside the serverQueue in order to not redo sending another queuelist
 * to the text-channel. Somewhat of a middleware function
 */
async function longQueueList(message: Message, serverQueue: Queue, serverDisconnectIdle: Idle){
    if(serverQueue.queue.endQueueList < serverQueue.songs.length){
        serverQueue.queue.endQueueList = serverQueue.queue.endQueueList + 10;
        getQueueList(message, serverQueue, serverDisconnectIdle);
    }
}

/**
 * @param  {Message} message the users message
 * @param  {Queue} serverQueue the current servers Queue
 * @param  {Idle} serverDisconnectIdle the current servers Idle
 * @description checks some conditions and either sends a queuelist to the text-channel of less than 10 songs or continues onto the getQueueList function for 
 * longer song queues. The reason for 10 songs being the max is the discord api limits MessageEmbed descriptions to less than 4096 characters
 */
export default async function queueList(message: Message, serverQueue: Queue, serverDisconnectIdle: Idle){
    if(serverQueue !== undefined){
        if (serverDisconnectIdle.queueMsgs[0]) {
            for (let i = 0;
                i < serverDisconnectIdle.queueMsgs.length;
                i++) {
                    if (!serverDisconnectIdle.queueMsgs[i].content) {
                        const channel: any = await serverDisconnectIdle.client.channels.fetch(serverDisconnectIdle.message.channelId);
                        const message = await channel.messages.fetch(serverDisconnectIdle.queueMsgs[i].id);
                        message.delete();
                    }
                    else {
                        serverDisconnectIdle.queueMsgs[i].delete();
                    }
                }
            serverDisconnectIdle.queueMsgs = [];
            writeGlobal('update dci', serverDisconnectIdle, message.guildId);
        }
        if(serverQueue.songs.length >= 2){
            serverQueue.queue.queueList = ``;
            serverQueue.queue.endQueueList = 10;
            serverQueue.queue.i = 0
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
                        value: `<@${serverQueue.currentsong[0].message.author.id}>`
                    },
                    {
                        name: 'Queue',
                        value: `No Other Songs`
                    }
                )
            ;
        let msg = await message.channel.send({embeds: [queueListEmbed]});
        serverDisconnectIdle.queueMsgs.push(msg);
        writeGlobal('update dci', serverDisconnectIdle, message.guildId);
        serverQueue.queue.queueList = ``;
        } 
    }else{
        const noSongsEmbed = new MessageEmbed()
            .setColor('RED')
            .setDescription(`:rofl: No Songs Currently In Queue`);
        const {DisconnectIdle} = getMaps();
        message.channel.send({embeds: [noSongsEmbed]})
        .then(msg => deleteMsg(msg, 30000, DisconnectIdle.get(1)));
    }  
}