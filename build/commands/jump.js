"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//checks if serverQueue exists if the queue length is > 0 and if the song specified extist if it does serverQueue.jump is set to the specified int
const discord_js_1 = require("discord.js");
const modules_1 = require("../modules/modules");
/**
 * @param  {Message} message the message from the user
 * @param  {any} args the content of the users message without the prefix and command
 * @param  {Queue} serverQueue the current servers queue
 * @param  {Idle} serverDisconnectIdle the current servers idle
 * @description jumps to a specified song via a search query or index
 */
async function jump(message, args, serverQueue, serverDisconnectIdle) {
    var i = parseInt(args);
    var query = args.join(' ');
    if (serverQueue) {
        if (serverQueue.loopsong === false) {
            if (serverQueue.songs.length > 1) {
                if (isNaN(i)) {
                    const result = await (0, modules_1.find)(serverQueue, query);
                    if (result == null || result.error === true) {
                        const noMatch = new discord_js_1.MessageEmbed()
                            .setColor('RED')
                            .setDescription(':rofl: No Exact Matches Found Please Check Your Spelling');
                        message.channel.send({ embeds: [noMatch] })
                            .then(msg => (0, modules_1.deleteMsg)(msg, 30000, serverDisconnectIdle.client));
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
                if (serverQueue.shuffle === false) {
                    if (serverQueue.songs[i]) {
                        serverQueue.jump = i;
                        const jumpEmbed = new discord_js_1.MessageEmbed()
                            .setColor('DARK_GOLD')
                            .setTitle('Jumping To Song')
                            .setDescription(`:arrow_heading_down: Now Jumping To ***[${serverQueue.songs[i].title}](${serverQueue.songs[i].url})***`)
                            .addFields({
                            name: `Requested By`, value: `<@${message.author.id}>`, inline: true,
                        }, {
                            name: `***Duration***`, value: `${serverQueue.songs[i].duration}`, inline: true
                        })
                            .setThumbnail(`${serverQueue.songs[i].thumbnail}`)
                            .setTimestamp();
                        message.channel.send({ embeds: [jumpEmbed] })
                            .then(msg => (0, modules_1.deleteMsg)(msg, 60000, serverDisconnectIdle.client));
                        serverQueue.player.stop();
                    }
                    else {
                        message.channel.send(':x: No Song Specified')
                            .then(msg => (0, modules_1.deleteMsg)(msg, 30000, serverDisconnectIdle.client));
                    }
                }
                else {
                    if (serverQueue.shuffledSongs[i]) {
                        serverQueue.jump = i;
                        const jumpEmbed = new discord_js_1.MessageEmbed()
                            .setColor('DARK_GOLD')
                            .setTitle('Jumping To Song')
                            .setDescription(`:arrow_heading_down: Now Jumping To ***[${serverQueue.shuffledSongs[i].title}](${serverQueue.shuffledSongs[i].url})***`)
                            .addFields({
                            name: `Requested By`, value: `<@${message.author.id}>`, inline: true,
                        }, {
                            name: `***Duration***`, value: `${serverQueue.shuffledSongs[i].duration}`, inline: true
                        })
                            .setThumbnail(`${serverQueue.shuffledSongs[i].thumbnail}`)
                            .setTimestamp();
                        message.channel.send({ embeds: [jumpEmbed] })
                            .then(msg => (0, modules_1.deleteMsg)(msg, 60000, serverDisconnectIdle.client));
                        serverQueue.player.stop();
                    }
                    else {
                        message.channel.send(':x: No Song Specified')
                            .then(msg => (0, modules_1.deleteMsg)(msg, 30000, serverDisconnectIdle.client));
                    }
                }
            }
            else {
                message.channel.send(':x: No Other Songs Besides The Current Exist In The Queue :x:')
                    .then(msg => (0, modules_1.deleteMsg)(msg, 30000, serverDisconnectIdle.client));
            }
        }
        else {
            message.channel.send(`:rofl: I Cannot Jump To A Song Wile I Am Looping A Song :rofl:`)
                .then(msg => (0, modules_1.deleteMsg)(msg, 30000, serverDisconnectIdle.client));
        }
    }
    else {
        message.channel.send(':rofl: I Dont Have A Song Queue :rofl:')
            .then(msg => (0, modules_1.deleteMsg)(msg, 30000, serverDisconnectIdle.client));
    }
}
exports.default = jump;
