"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const modules_1 = require("../modules/modules");
module.exports = {
    name: 'stop',
    description: 'stops playing and clears the queue',
    /**
     * @param  {Message} message the users Message
     * @param  {Queue} serverQueue the current servers Queue
     * @param  {any} queue the map that holds all of the Queues
     * @param  {any} DisconnectIdle the map that holds all of the Idles
     * @param  {Idle} serverDisconnectIdle the current servers Idles
     * @description sets the serverQueue.stop bool to true, deletes the serverQueue from the
     * queue map and starts the {@link serverDisconnectIdle.disconnectTimervcidle}
     */
    async clear(message, serverQueue, queue, DisconnectIdle, serverDisconnectIdle) {
        const voiceChannel = message.member.voice.channel;
        if (serverQueue) {
            if (!serverQueue.player) {
            }
            else {
                serverQueue.stop = true;
                serverQueue.player.stop();
            }
            queue.delete(message.guildId);
            await (0, modules_1.writeGlobal)('delete queue', null, serverQueue.id);
            (0, modules_1.writeGlobal)('delete dci', null, serverQueue.id);
            const stopEmbed = new discord_js_1.MessageEmbed()
                .setColor('RED')
                .setDescription(`:octagonal_sign: I Have ***Stopped*** The Music!`);
            message.channel.send({ embeds: [stopEmbed] })
                .then(msg => (0, modules_1.deleteMsg)(msg, 60000, serverDisconnectIdle.client));
            if (serverDisconnectIdle) {
                serverDisconnectIdle.disconnectTimervcidle(queue, DisconnectIdle);
            }
        }
        else {
            const notPlayingEmbed = new discord_js_1.MessageEmbed()
                .setColor('RED')
                .setDescription(`:rofl: Nothing ***Playing*** Currently!`);
            message.channel.send({ embeds: [notPlayingEmbed] })
                .then(msg => (0, modules_1.deleteMsg)(msg, 30000, serverDisconnectIdle.client));
        }
    }
};
