"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
function leave(msg, DisconnectIdle, queue) {
    return __awaiter(this, void 0, void 0, function* () {
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
                        const channel = yield sdi.client.channels.fetch(sdi.message.channelId);
                        const message = yield channel.messages.fetch(sdi.msgs[i].id);
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
                        const channel = yield sdi.client.channels.fetch(sdi.message.channelId);
                        const message = yield channel.messages.fetch(sdi.queueMsgs[i].id);
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
                yield (0, writeglobal_1.default)('delete queue', null, id);
            }
            if (sdi) {
                DisconnectIdle.delete(id);
                yield (0, writeglobal_1.default)('delete dci', null, id);
            }
        }
    });
}
exports.default = leave;
