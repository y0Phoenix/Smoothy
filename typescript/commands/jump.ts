//checks if serverQueue exists if the queue length is > 0 and if the song specified extist if it does serverQueue.jump is set to the specified int
import { Colors, EmbedBuilder, Message } from 'discord.js';
import { Idle } from '../Classes/Idle';
import Queue from '../Classes/Queue';
import {deleteMsg, find } from '../modules/modules';
import sendMessage from '../modules/src/sendMessage';

/**
 * @param  {Message} message the message from the user
 * @param  {any} args the content of the users message without the prefix and command
 * @param  {Queue} serverQueue the current servers queue
 * @param  {Idle} serverDisconnectIdle the current servers idle
 * @description jumps to a specified song via a search query or index
 */
export default async function jump(message: Message, args: any, serverQueue: Queue, serverDisconnectIdle: Idle){
    var i = parseInt(args);
    var query = args.join(' ');
    if(serverQueue){
        if(serverQueue.loopsong === false){
            if(serverQueue.songs.length > 1){
                if (isNaN(i)) {
                    const result = await find(serverQueue, query);
                    if (result == null || result.error === true) {
                        const noMatch = new EmbedBuilder() 
                            .setColor(Colors.Red)
                            .setDescription(':rofl: No Exact Matches Found Please Check Your Spelling')
                        ;
                        sendMessage({embeds: [noMatch]}, message)
                            .then(msg => deleteMsg(msg, 30000, serverDisconnectIdle.client))
                        ;
                        return;
                    }
                    if (result.shuffledSong) {
                        i = result.shuffledSong;
                    }
                    else {
                        i = result.song;
                    }
                    // todo improve algorithm
                    // if (proceed) {
                    //     const result = topResult(options); `     
                    //     i = arr.map(song => song.title).indexOf(result);
                    // }
                }
                if(serverQueue.shuffle === false){
                    if(serverQueue.songs[i]){
                        serverQueue.jump = i;
                            const jumpEmbed = new EmbedBuilder()
                            .setColor(Colors.DarkGold)
                            .setTitle('Jumping To Song')
                            .setDescription(`:arrow_heading_down: Now Jumping To ***[${serverQueue.songs[i].title}](${serverQueue.songs[i].url})***`)
                            .addFields(
                                {
                                    name: `Requested By` , value: `<@${message.author.id}>`, inline: true,
                                },
                                {
                                    name: `***Duration***`, value: `${serverQueue.songs[i].duration}`, inline: true
                                })
                            .setThumbnail(`${serverQueue.songs[i].thumbnail}`)
                            .setTimestamp();
                        sendMessage({embeds: [jumpEmbed]}, message)
                        .then(msg => deleteMsg(msg, 60000, serverDisconnectIdle.client));
                        serverQueue.player.stop();
                    }
                    else{
                        sendMessage(':x: No Song Specified', message)
                        .then(msg => deleteMsg(msg, 30000, serverDisconnectIdle.client));
                    }
                }
                else{
                    if(serverQueue.shuffledSongs[i]){
                        serverQueue.jump = i;
                        const jumpEmbed = new EmbedBuilder()
                            .setColor(Colors.DarkGold)
                            .setTitle('Jumping To Song')
                            .setDescription(`:arrow_heading_down: Now Jumping To ***[${serverQueue.shuffledSongs[i].title}](${serverQueue.shuffledSongs[i].url})***`)
                            .addFields(
                                {
                                    name: `Requested By` , value: `<@${message.author.id}>`, inline: true,
                                },
                                {
                                    name: `***Duration***`, value: `${serverQueue.shuffledSongs[i].duration}`, inline: true
                                })
                            .setThumbnail(`${serverQueue.shuffledSongs[i].thumbnail}`)
                            .setTimestamp();
                        sendMessage({embeds: [jumpEmbed]}, message)
                        .then(msg => deleteMsg(msg, 60000, serverDisconnectIdle.client));
                        serverQueue.player.stop();
                    }
                    else{
                        sendMessage(':x: No Song Specified', message)
                        .then(msg => deleteMsg(msg, 30000, serverDisconnectIdle.client));
                    }
                }
            }
            else{
                sendMessage(':x: No Other Songs Besides The Current Exist In The Queue :x:', message)
                .then(msg => deleteMsg(msg, 30000, serverDisconnectIdle.client));
            }
        }
        else{
            sendMessage(`:rofl: I Cannot Jump To A Song Wile I Am Looping A Song :rofl:`, message)
            .then(msg => deleteMsg(msg, 30000, serverDisconnectIdle.client));
        }
    }else{
        sendMessage(':rofl: I Dont Have A Song Queue :rofl:', message)
        .then(msg => deleteMsg(msg, 30000, serverDisconnectIdle.client));
    }     
}