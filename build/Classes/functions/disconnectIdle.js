"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectTimervcidle = exports.disconnectvcidle = void 0;
const discord_js_1 = require("discord.js");
const maps_1 = require("../../maps");
const modules_1 = require("../../modules/modules");
/**
 *  @param  {} queue the map that holds all of the serverQueues
 *  @param  {} DisconnectIdle the map that holds all of the servers Idles
 *  @description disconnects from voiceConnection after 1800000 ms or 30 min
 */
async function disconnectvcidle(queue, DisconnectIdle, serverDisconnectIdle) {
    const vcIdleEmbed = new discord_js_1.MessageEmbed()
        .setColor('RED')
        .setDescription(':cry: Left VC Due To Idle');
    const msg = await serverDisconnectIdle.message.channel.send({ embeds: [vcIdleEmbed] });
    (0, modules_1.deleteMsg)(msg, 60000, DisconnectIdle.get(1));
    console.log(`Left VC Due To Idle`);
    (0, modules_1.leave)(serverDisconnectIdle.message, DisconnectIdle, queue);
}
exports.disconnectvcidle = disconnectvcidle;
/**
 * @description starts the timer for 1800000 ms or 30 min which disconnects from voiceConnection
 * this timer only starts when the audioPlayer is Idle
 */
function disconnectTimervcidle() {
    const maps = (0, maps_1.default)();
    const { DisconnectIdle, queue } = maps;
    this.disconnectTimer = setTimeout(this.disconnectvcidle, 1800000, queue, DisconnectIdle, this);
    console.log('Starting disconnectTimer Timeout');
}
exports.disconnectTimervcidle = disconnectTimervcidle;
