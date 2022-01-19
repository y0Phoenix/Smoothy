"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const voice_1 = require("@discordjs/voice");
const deleteMsg_1 = require("./deleteMsg");
const writeglobal_1 = require("./writeglobal");
/**
 * @param  {} queue the queue map for songs
 * @param  {} DisconnectIdle the map for idle timer and message arrays
 * @param  {} message any message object from the discord server needed for GuidId
 */
async function leave(msg, DisconnectIdle, queue) {
    const id = msg.guild.id;
    const vc = (0, voice_1.getVoiceConnection)(id);
    const sdi = DisconnectIdle.get(id);
    const sq = queue.get(id);
    const client = DisconnectIdle.get(1);
    if (vc) {
        if (sq) {
            if (sq.nowPlaying) {
                (0, deleteMsg_1.default)(sq.nowPlaying, 0, client);
            }
        }
        sdi.msgs.forEach(msg => {
            (0, deleteMsg_1.default)(msg, 0, client);
        });
        sdi.queueMsgs.forEach(msg => {
            (0, deleteMsg_1.default)(msg, 0, client);
        });
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
