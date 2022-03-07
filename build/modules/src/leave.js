"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const voice_1 = require("@discordjs/voice");
const deleteMsg_1 = require("./deleteMsg");
const writeglobal_1 = require("./writeglobal");
const maps_1 = require("../../maps");
/**
 * @param  {} queue the queue map for songs
 * @param  {} DisconnectIdle the map for idle timer and message arrays
 * @param  {} message any message object from the discord server needed for GuidId
 */
async function leave(msg) {
    const { DisconnectIdle, queue } = (0, maps_1.default)();
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
        if (!sdi)
            return;
        sdi.msgs.forEach(msg => {
            (0, deleteMsg_1.default)(msg, 0, client);
        });
        sdi.queueMsgs.forEach(msg => {
            (0, deleteMsg_1.default)(msg, 0, client);
        });
        vc.destroy();
        queue.delete(id);
        await (0, writeglobal_1.default)('delete queue', null, id);
        DisconnectIdle.delete(id);
        await (0, writeglobal_1.default)('delete dci', null, id);
    }
}
exports.default = leave;
