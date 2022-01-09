"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Idle = exports.WriteIdle = void 0;
const discord_js_1 = require("discord.js");
const WriteMessage_1 = require("./WriteMessage");
const modules_1 = require("../modules/modules");
const maps_1 = require("../maps");
class WriteIdle {
    constructor(data) {
        this.disconnectTimer = null;
        this.msgs = [];
        this.queueMsgs = [];
        this.message = new WriteMessage_1.default(data.message);
        this.id = data.message.guild.id;
        this.client = null;
        if (!data.msgs) {
        }
        else {
            data.msgs.forEach(msg => {
                this.msgs.push(new WriteMessage_1.default(msg));
            });
            data.queueMsgs.forEach(msg => {
                this.queueMsgs.push(new WriteMessage_1.default(msg));
            });
        }
    }
}
exports.WriteIdle = WriteIdle;
class Idle {
    constructor(data) {
        this.msgs = [];
        this.queueMsgs = [];
        this.message = data.message;
        this.id = data.message.guild.id;
        this.client = data.client;
    }
    /**
 *@param  {} queue the map that holds all of the serverQueues
 * @param  {} DisconnectIdle the map that holds all of the servers Idles
 * @description disconnects from voiceConnection after 1800000 ms or 30 min
 */
    disconnectvcidle(queue, DisconnectIdle) {
        const vcIdleEmbed = new discord_js_1.MessageEmbed()
            .setColor('RED')
            .setDescription(':cry: Left VC Due To Idle');
        this.message.channel.send({ embeds: [vcIdleEmbed] });
        console.log(`Left VC Due To Idle`);
        (0, modules_1.leave)(queue, DisconnectIdle, this.message);
    }
    /**
     * @description starts the timer for 1800000 ms or 30 min which disconnects from voiceConnection
     * this timer only starts when the audioPlayer is Idle
     */
    disconnectTimervcidle() {
        const maps = (0, maps_1.default)();
        const { DisconnectIdle, queue } = maps;
        this.disconnectTimer = setTimeout(this.disconnectvcidle, 1800000, queue, DisconnectIdle);
        console.log('Starting disconnectTimer Timeout');
    }
}
exports.Idle = Idle;
