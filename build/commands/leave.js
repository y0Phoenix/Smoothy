"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const modules_1 = require("../modules/modules");
const noVCEmbed = new discord_js_1.MessageEmbed()
    .setColor('RED')
    .setDescription(`:rofl: I Am Not In VC`);
/**
 * @param  {Message} message the message from the channel
 * @param  {any} queue the map that holds all of the queues
 * @param  {Queue} serverQueue the current servers queue
 * @param  {any} DisconnectIdle the map that holds all of the idles
 * @param  {Idle} serverDisconnectIdle current servers idle
 * @description leaves the voice channel, deletes the serverQueue from the queue map and deletes all the messages inside the serverDisconnectIdle msgs and queueMSGs arrays
 */
async function Leave(message, queue, serverQueue, DisconnectIdle, serverDisconnectIdle) {
    const voiceConnection = (0, voice_1.getVoiceConnection)(message.guild.id);
    if (voiceConnection) {
        if (voiceConnection.state.status === voice_1.VoiceConnectionStatus.Ready) {
            const leaveEmbed = new discord_js_1.MessageEmbed()
                .setColor('RED')
                .setDescription(`:cry: Leaving Channel`);
            message.channel.send({ embeds: [leaveEmbed] })
                .then(msg => (0, modules_1.deleteMsg)(msg, 60000, serverDisconnectIdle.client));
            console.log('Left The Voice Channel From Command');
            if (serverQueue) {
                if (serverQueue.player.state.status === voice_1.AudioPlayerStatus.Playing) {
                    serverQueue.stop = true;
                    serverQueue.player.stop();
                }
            }
            if (serverDisconnectIdle.disconnectTimer !== undefined) {
                clearTimeout(serverDisconnectIdle.disconnectTimer);
            }
            (0, modules_1.leave)(message, DisconnectIdle, queue);
        }
        else {
            message.channel.send({ embeds: [noVCEmbed] })
                .then(msg => (0, modules_1.deleteMsg)(msg, 30000, serverDisconnectIdle.client));
            return;
        }
    }
    else {
        message.channel.send({ embeds: [noVCEmbed] })
            .then(msg => (0, modules_1.deleteMsg)(msg, 30000, serverDisconnectIdle.client));
        return;
    }
}
exports.default = Leave;
