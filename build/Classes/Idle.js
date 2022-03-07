"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Idle = exports.WriteIdle = void 0;
const WriteMessage_1 = require("./WriteMessage");
const maps_1 = require("../maps");
const disconnectIdle_1 = require("./functions/disconnectIdle");
const voice_1 = require("@discordjs/voice");
const executive_1 = require("../executive");
const modules_1 = require("../modules/modules");
class WriteIdle {
    message;
    id;
    client;
    disconnectTimer = null;
    msgs = [];
    queueMsgs = [];
    top5Msg = null;
    top5Results = [];
    tries = 0;
    disconnectvcidle = null;
    disconnectTimervcidle = null;
    constructor(data) {
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
    message;
    id;
    client;
    disconnectTimer;
    voiceConnection = null;
    msgs = [];
    queueMsgs = [];
    top5Msg = null;
    top5Results = [];
    tries = 0;
    disconnectvcidle;
    disconnectTimervcidle;
    constructor(data) {
        this.message = data.message;
        this.id = data.message.guild.id;
        this.client = data.client;
        this.disconnectTimervcidle = disconnectIdle_1.disconnectTimervcidle;
        this.disconnectvcidle = disconnectIdle_1.disconnectvcidle;
        this.voiceConnection = (0, voice_1.getVoiceConnection)(this.id);
        const { DisconnectIdle, queue } = (0, maps_1.default)();
        if (!this.voiceConnection) {
            const join = async () => {
                const bool = await (0, modules_1.exists)(this.id, 'dci');
                this.voiceConnection = await (0, executive_1.joinvoicechannel)(this.message, this.message.member.voice.channel, DisconnectIdle, DisconnectIdle.get(this.id), DisconnectIdle.get(1), bool);
            };
            join();
        }
    }
}
exports.Idle = Idle;
