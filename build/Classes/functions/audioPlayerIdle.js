"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const voice_1 = require("@discordjs/voice");
const modules_1 = require("../../modules/modules");
const discord_js_1 = require("discord.js");
const maps_1 = require("../../maps");
/**
 * @description sets of functions and/or events based off of conditions inorder to play a new song
 */
async function audioPlayerIdle() {
    let serverQueue = this;
    const maps = (0, maps_1.default)();
    const { DisconnectIdle, queue } = maps;
    const serverDisconnectIdle = DisconnectIdle.get(serverQueue.id);
    console.log('Player Status Is Idle');
    const noMoreSongsEmbed = new discord_js_1.MessageEmbed()
        .setColor('RED')
        .setDescription(`:x: No More Songs To Play`);
    if (serverQueue.stop === true) {
    }
    else {
        if (serverQueue.player.state.status === voice_1.AudioPlayerStatus.Idle && !serverQueue.audioPlayerErr) {
            serverQueue.messagesent = false;
            if (serverQueue.nowPlaying) {
                (0, modules_1.deleteMsg)(serverQueue.nowPlaying, 0, serverDisconnectIdle.client);
                serverQueue.nowPlaying = undefined;
            }
            if (serverQueue.jumpbool === true) {
                serverQueue.jumpbool = false;
            }
            // song ending while previous is true
            if (serverQueue.previousbool) {
                serverQueue.playNext();
                serverQueue.currentsong.shift();
                serverQueue.bool = true;
                return;
            }
            else {
                serverQueue.previous.shift();
                serverQueue.previous.push(serverQueue.currentsong[0]);
                //normal song ending
                if (!serverQueue.loop && !serverQueue.loopsong && !serverQueue.shuffle && serverQueue.jump === 0 && !serverQueue.repeat) {
                    serverQueue.bool ? serverQueue.bool = false : serverQueue.songs.shift();
                    if (serverQueue.songs.length > 0) {
                        serverQueue.playNext();
                    }
                    else {
                        const msg = await serverQueue.message.channel.send({ embeds: [noMoreSongsEmbed] });
                        (0, modules_1.deleteMsg)(msg, 60000, serverDisconnectIdle.client);
                        queue.delete(serverQueue.message.guild.id);
                        await (0, modules_1.writeGlobal)('delete queue', null, serverQueue.id);
                        (0, modules_1.writeGlobal)('delete dci', null, serverQueue.id);
                        serverDisconnectIdle.disconnectTimervcidle();
                    }
                }
                //song ending while loop is true and loopsong is false
                else if (serverQueue.loop === true && serverQueue.loopsong === false && serverQueue.shuffle === false && serverQueue.jump === 0 &&
                    serverQueue.repeat === false) {
                    serverQueue.loopNextSong();
                    console.log('Playing Next Song In Looped Queue');
                }
                //song ending whil loopsong is true
                else if (serverQueue.loopsong === true) {
                    console.log('Playing Looped Current Song');
                    serverQueue.playNext();
                }
                //song ending while repeat is true
                else if (serverQueue.repeat === true) {
                    serverQueue.playNext();
                }
                //song ending while jump > 0
                else if (serverQueue.jump > 0) {
                    serverQueue.playNext();
                }
                //song ending while shuffle is true
                else {
                    if (serverQueue.shuffle === true && serverQueue.loop === true) {
                        serverQueue.loopNextSong();
                    }
                    else {
                        const currentsong = serverQueue.shuffledSongs[0];
                        serverQueue.findSplice(currentsong);
                        serverQueue.shuffledSongs.shift();
                        if (serverQueue.shuffledSongs.length > 0) {
                            serverQueue.playNext();
                        }
                        else {
                            const noMoreSongsEmbed = new discord_js_1.MessageEmbed()
                                .setColor('RED')
                                .setDescription(`:x: No More Songs To Play`);
                            serverQueue.message.channel.send({ embeds: [noMoreSongsEmbed] });
                            queue.delete(serverQueue.message.guild.id);
                            (0, modules_1.writeGlobal)('delete queue', null, serverQueue.id);
                            serverDisconnectIdle.disconnectTimervcidle();
                        }
                    }
                }
            }
        }
        else {
        }
    }
}
exports.default = audioPlayerIdle;
