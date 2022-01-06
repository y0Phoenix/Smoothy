"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const voice_1 = require("@discordjs/voice");
const writeglobal_1 = __importDefault(require("./writeglobal"));
/**
 * @param  {} queue the queue map for songs
 * @param  {} DisconnectIdle the map for idle timer and message arrays
 * @param  {} message any message object from the discord server needed for GuidId
 */
async function leave(msg, DisconnectIdle, queue) {
    const id = msg.guildId;
    const vc = (0, voice_1.getVoiceConnection)(id);
    const sdi = DisconnectIdle.get(id);
    const sq = queue.get(id);
    if (vc) {
        if (sq) {
            if (sq.nowPlaying) {
                sq.nowPlaying.delete();
            }
        }
        if (sdi.msgs[0]) {
            for (let i = 0; i < sdi.msgs.length; i++) {
                if (!sdi.msgs[i].content) {
                    const channel = await sdi.client.channels.fetch(sdi.message.channelId);
                    const message = await channel.messages.fetch(sdi.msgs[i].id);
                    message.delete();
                }
                else {
                    sdi.msgs[i].delete();
                }
            }
        }
        if (sdi.queueMsgs[0]) {
            for (let i = 0; i < sdi.queueMsgs.length; i++) {
                if (!sdi.queueMsgs[i].content) {
                    const channel = await sdi.client.channels.fetch(sdi.message.channelId);
                    const message = await channel.messages.fetch(sdi.queueMsgs[i].id);
                    message.delete();
                }
                else {
                    sdi.queueMsgs[i].delete();
                }
            }
        }
        if (vc) {
            vc.disconnect();
        }
        if (sq) {
            queue.delete(id);
            await (0, writeglobal_1.default)('delete queue', null, id);
        }
        if (sdi) {
            DisconnectIdle.delete(id);
            await (0, writeglobal_1.default)('delete dci', null, id);
        }
    }
}
exports.default = leave;
