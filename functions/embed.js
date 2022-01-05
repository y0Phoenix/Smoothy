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
const modules_1 = require("../modules/modules");
/**
 * @param  {} message the message that has the channel you wish to send to
 * @param  {} embed the embed message you wish to send
 * @param  {} time the time after the message is sent to delete it
 */
function embedSend(message, embed, time) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let msg = yield message.channel.send({ embeds: embed });
            if (!time) {
                return;
            }
            (0, modules_1.deleteMsg)(msg, time);
            return msg;
        }
        catch (err) {
            console.error(err);
        }
    });
}
exports.default = embedSend;
