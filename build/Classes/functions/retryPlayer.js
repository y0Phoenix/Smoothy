"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryTimer = exports.checkIfPlaying = void 0;
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const modules_1 = require("../../modules/modules");
const getVideo_1 = require("./getVideo");
/**
 * @param  {Queue} serverQueue the current servers queue
 * @description checks if the serverQueue is playing a song via
 * AudioPlayerStatus
 * @returns {boolean} boolean value
 */
async function checkIfPlaying(serverQueue) {
    if (serverQueue.player.state.status === voice_1.AudioPlayerStatus.Playing) {
        return true;
    }
    else {
        return false;
    }
}
exports.checkIfPlaying = checkIfPlaying;
/**
 * @param  {Queue} serverQueue the currents servers queue
 * @param  {any} queue the map that holds all of the server queues
 * @param  {any} DisconnectIdle the map that holds all of the server Idles
 * @param  {Idle} serverDisconnectIdle the current servers Idle
 */
async function retryTimer(serverQueue, queue, DisconnectIdle, serverDisconnectIdle) {
    if (serverQueue.player.state.status !== voice_1.AudioPlayerStatus.Playing && serverQueue.tries < 5 && serverQueue.loop === false) {
        if (serverQueue.jumpbool === true) {
            const result = await (0, modules_1.find)(serverQueue, serverQueue.currentsong[0].title);
            if (result !== null) {
                if (result.shuffledSong !== null) {
                    serverQueue.jump = result.shuffledSong;
                }
                else {
                    serverQueue.jump = result.song;
                }
            }
            else {
                const errorEmbed = new discord_js_1.MessageEmbed()
                    .setColor('RED')
                    .setDescription(`:thumbsdown: [${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url}) failed to play reverting to original queue try again later`);
                serverQueue.message.channel.send({ embeds: [errorEmbed] });
            }
        }
        serverQueue.currentsong.shift();
        await (0, getVideo_1.default)(serverQueue);
        console.log(`Retrying ${serverQueue.currentsong[0].title} at ${serverQueue.currentsong[0].url}`);
        serverQueue.play(queue, DisconnectIdle, serverDisconnectIdle);
        if (serverQueue.tries >= 4) {
            serverQueue.message.channel
                .send(`Smoothy Is Buffering Please Wait`)
                .then((msg) => (0, modules_1.deleteMsg)(msg, 30000, serverDisconnectIdle.client));
        }
    }
}
exports.retryTimer = retryTimer;
