"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//sets serverQueue.loopsong to true if false, else sets it to false
const discord_js_1 = require("discord.js");
const modules_1 = require("../modules/modules");
/**
 * @param  {Message} message the users message
 * @param  {Queue} serverQueue the current servers Queue
 * @param  {Idle} serverDisconnectIdle the current servers Idle
 * @description sets the loopsong boolean to true inside the serverQueue
 */
async function loopsong(message, serverQueue, serverDisconnectIdle) {
    if (serverQueue) {
        if (serverQueue.loopsong === false) {
            serverQueue.loopsong = true;
            const loopSongEmbed = new discord_js_1.MessageEmbed()
                .setColor('ORANGE')
                .setDescription(`:thumbsup: Now Looping ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})*** :repeat_one:`);
            let msg = await message.channel.send({ embeds: [loopSongEmbed] });
            serverDisconnectIdle.msgs.push(msg);
            await (0, modules_1.writeGlobal)('update dci', serverDisconnectIdle, message.guildId);
            (0, modules_1.writeGlobal)('update queue', serverQueue, message.guildId);
        }
        else {
            serverQueue.loopsong = false;
            const endLoopSongEmbed = new discord_js_1.MessageEmbed()
                .setColor('ORANGE')
                .setDescription(`:x: No Longer Looping ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})***`);
            message.channel.send({ embeds: [endLoopSongEmbed] })
                .then(msg => (0, modules_1.deleteMsg)(msg, 60000, serverDisconnectIdle.client));
            (0, modules_1.writeGlobal)('update queue', serverQueue, message.guildId);
        }
    }
    else {
        const notPlayingEmbed = new discord_js_1.MessageEmbed()
            .setColor('ORANGE')
            .setDescription(`:rofl: Nothing Playing Right Now`);
        message.channel.send({ embeds: [notPlayingEmbed] })
            .then(msg => (0, modules_1.deleteMsg)(msg, 30000, serverDisconnectIdle.client));
    }
}
exports.default = loopsong;
