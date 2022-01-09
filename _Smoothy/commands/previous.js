"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const modules_1 = require("../modules/modules");
const noSongs = new discord_js_1.MessageEmbed()
    .setColor('RED')
    .setDescription(':rofl: Cant Play A Previous Song');
module.exports = {
    name: 'previous',
    description: 'play the last song',
    /**
     * @param  {Message} message the users message
     * @param  {Queue} serverQueue the current servers Queue
     * @param  {Idle} serverDisconnectIdle the current servers Idle
     * @description sets the previousbool inside serverQueue to true and stops the audioplayer inside serverQueue which sets off the idle event listener on the audioplayer
     */
    async previous(message, serverQueue, serverDisconnectIdle) {
        if (serverQueue) {
            if (serverQueue.previous.length > 0) {
                if (serverQueue.player.state.status === voice_1.AudioPlayerStatus.Playing) {
                    serverQueue.previousbool = true;
                    const previousEmbed = new discord_js_1.MessageEmbed()
                        .setColor('GREEN')
                        .setDescription(`:thumbsup: Going Back To [${serverQueue.previous[0].title}](${serverQueue.previous[0].url})`);
                    let msg = await message.channel.send({ embeds: [previousEmbed] });
                    (0, modules_1.deleteMsg)(msg, 60000, serverDisconnectIdle.client);
                    serverQueue.player.stop();
                }
                else {
                    const pausedEmbed = new discord_js_1.MessageEmbed()
                        .setColor('RED')
                        .setDescription(':rofl: Cant Play The Previos Song While Paused');
                    let msg = await message.channel.send({ embeds: [pausedEmbed] });
                    (0, modules_1.deleteMsg)(msg, 30000, serverDisconnectIdle.client);
                }
            }
            else {
                let msg = await message.channel.send({ embeds: [noSongs] });
                (0, modules_1.deleteMsg)(msg, 30000, serverDisconnectIdle.client);
            }
        }
        else {
            let msg = await message.channel.send({ embeds: [noSongs] });
            (0, modules_1.deleteMsg)(msg, 30000, serverDisconnectIdle.client);
        }
    }
};
