"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryTimer = exports.checkIfPlaying = void 0;
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const modules_1 = require("../../modules/modules");
const maps_1 = require("../../maps");
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
 */
async function retryTimer() {
    const serverQueue = this;
    const maps = (0, maps_1.default)();
    const serverDisconnectIdle = maps.DisconnectIdle.get(serverQueue.id);
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
        await serverQueue.getVideo();
        console.log(`Retrying ${serverQueue.currentsong[0].title} at ${serverQueue.currentsong[0].url}`);
        serverQueue.play(maps.queue, maps.DisconnectIdle, serverDisconnectIdle);
        if (serverQueue.tries >= 4) {
            serverQueue.message.channel
                .send(`Smoothy Is Buffering Please Wait`)
                .then((msg) => (0, modules_1.deleteMsg)(msg, 30000, serverDisconnectIdle.client));
        }
    }
}
exports.retryTimer = retryTimer;
