"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modules_1 = require("../modules/modules");
const main_1 = require("../main");
/**
 * @param  {} message the message that has the channel you wish to send to
 * @param  {} embed the embed message you wish to send
 * @param  {} time the time after the message is sent to delete it
 */
async function embedSend(message, embed, time) {
    try {
        let msg = await message.channel.send({ embeds: [embed] });
        if (!time) {
            return;
        }
        const dci = main_1.DisconnectIdle.get(message.guild.id);
        (0, modules_1.deleteMsg)(msg, time, dci.client);
        return msg;
    }
    catch (err) {
        console.error(err);
    }
}
exports.default = embedSend;
