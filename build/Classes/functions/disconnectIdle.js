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
function disconnectvcidle(queue, DisconnectIdle) {
    const vcIdleEmbed = new discord_js_1.MessageEmbed()
        .setColor('RED')
        .setDescription(':cry: Left VC Due To Idle');
    this.message.channel.send({ embeds: [vcIdleEmbed] });
    console.log(`Left VC Due To Idle`);
    (0, modules_1.leave)(queue, DisconnectIdle, this.message);
}
exports.disconnectvcidle = disconnectvcidle;
/**
 * @description starts the timer for 1800000 ms or 30 min which disconnects from voiceConnection
 * this timer only starts when the audioPlayer is Idle
 */
function disconnectTimervcidle() {
    const maps = (0, maps_1.default)();
    const { DisconnectIdle, queue } = maps;
    this.disconnectTimer = setTimeout(this.disconnectvcidle, 1800000, queue, DisconnectIdle);
    console.log('Starting disconnectTimer Timeout');
}
exports.disconnectTimervcidle = disconnectTimervcidle;
