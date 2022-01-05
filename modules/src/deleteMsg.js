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
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../../main");
/**
 * @param  {} message the message to delete
 * @param  time number needed for the amount of time before a message delete defaults to 30 sec
 */
function deleteMsg(message, time) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!time || isNaN(time)) {
            time = 30000;
        }
        if (!message) {
            return;
        }
        else {
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                const Idle = main_1.DisconnectIdle.get(message.guild.id);
                const channel = yield Idle.client.channels.fetch(message.channel.id);
                const msg = yield channel.messages.fetch(message.id);
                if (msg.deleted === true) {
                    return;
                }
                yield msg.delete();
            }), time);
        }
    });
}
exports.default = deleteMsg;
