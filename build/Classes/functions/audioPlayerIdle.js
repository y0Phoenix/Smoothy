"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const playNext_1 = require("./playNext");
const findSplice_1 = require("./findSplice");
const loopNextSong_1 = require("./loopNextSong");
const voice_1 = require("@discordjs/voice");
const modules_1 = require("../../modules/modules");
const discord_js_1 = require("discord.js");
/**
 * @param  {Queue} serverQueue the current servers queue
 * @param  {any} queue the map that holds all of the serverQueus
 * @param  {any} DisconnectIdle the map that holds all of the Idles
 * @param  {Idle} serverDisconnectIdle the current servers Idle
 */
async function audioPlayerIdle(serverQueue, queue, DisconnectIdle, serverDisconnectIdle) {
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
                (0, modules_1.deleteMsg)(serverQueue.message, 0, serverDisconnectIdle.client);
                serverQueue.nowPlaying = undefined;
            }
            if (serverQueue.jumpbool === true) {
                serverQueue.jumpbool = false;
            }
            // song ending while previous is true
            if (serverQueue.previousbool) {
                (0, playNext_1.default)(queue, DisconnectIdle, serverDisconnectIdle);
                serverQueue.currentsong.shift();
                serverQueue.bool = true;
            }
            else {
                serverQueue.previous.shift();
                serverQueue.previous.push(serverQueue.currentsong[0]);
                //normal song ending
                if (!serverQueue.loop && !serverQueue.loopsong && !serverQueue.shuffle && serverQueue.jump === 0 && !serverQueue.repeat) {
                    serverQueue.bool ? serverQueue.bool = false : serverQueue.songs.shift();
                    if (serverQueue.songs.length > 0) {
                        serverQueue.playnext(queue, DisconnectIdle, serverDisconnectIdle);
                    }
                    else {
                        serverQueue.message.channel.send({ embeds: [noMoreSongsEmbed] });
                        serverDisconnectIdle = DisconnectIdle.get(serverQueue.message.guild.id);
                        queue.delete(serverQueue.message.guild.id);
                        await (0, modules_1.writeGlobal)('delete queue', null, serverQueue.id);
                        (0, modules_1.writeGlobal)('delete dci', null, serverQueue.id);
                        serverDisconnectIdle.disconnectTimervcidle(queue, DisconnectIdle);
                    }
                }
                //song ending while loop is true and loopsong is false
                else if (serverQueue.loop === true && serverQueue.loopsong === false && serverQueue.shuffle === false && serverQueue.jump === 0 &&
                    serverQueue.repeat === false && serverQueue.previousbool === false) {
                    (0, loopNextSong_1.default)(queue, DisconnectIdle, serverDisconnectIdle);
                    console.log('Playing Next Song In Looped Queue');
                }
                //song ending whil loopsong is true
                else if (serverQueue.loopsong === true) {
                    console.log('Playing Looped Current Song');
                    (0, playNext_1.default)(queue, DisconnectIdle, serverDisconnectIdle);
                }
                //song ending while repeat is true
                else if (serverQueue.repeat === true) {
                    (0, playNext_1.default)(queue, DisconnectIdle, serverDisconnectIdle);
                }
                //song ending while jump > 0
                else if (serverQueue.jump > 0) {
                    (0, playNext_1.default)(queue, DisconnectIdle, serverDisconnectIdle);
                }
                //song ending while shuffle is true
                else {
                    if (serverQueue.shuffle === true && serverQueue.loop === true && serverQueue.loopsong === false
                        && serverQueue.jump === 0 && serverQueue.repeat === false && serverQueue.previousbool === false) {
                        (0, loopNextSong_1.default)(queue, DisconnectIdle, serverDisconnectIdle);
                    }
                    else {
                        const currentsong = serverQueue.shuffledSongs[0];
                        (0, findSplice_1.default)(currentsong);
                        serverQueue.shuffledSongs.shift();
                        if (serverQueue.shuffledSongs.length > 0) {
                            (0, playNext_1.default)(queue, DisconnectIdle, serverDisconnectIdle);
                        }
                        else {
                            const noMoreSongsEmbed = new discord_js_1.MessageEmbed()
                                .setColor('RED')
                                .setDescription(`:x: No More Songs To Play`);
                            serverQueue.message.channel.send({ embeds: [noMoreSongsEmbed] });
                            serverDisconnectIdle = DisconnectIdle.get(serverQueue.message.guild.id);
                            queue.delete(serverQueue.message.guild.id);
                            (0, modules_1.writeGlobal)('delete queue', null, serverQueue.id);
                            serverDisconnectIdle.disconnectTimervcidle(queue, DisconnectIdle);
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