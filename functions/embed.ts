import { Message } from "discord.js";
import { deleteMsg } from "../modules/modules";

/**
 * @param  {} message the message that has the channel you wish to send to 
 * @param  {} embed the embed message you wish to send
 * @param  {} time the time after the message is sent to delete it
 */
export default async function embedSend(message, embed, time) {
    try {
        let msg: Partial<Message> = await message.channel.send({embeds: embed});
        if (!time) {
            return;
        }
        deleteMsg(msg, time);
        return msg;
    } catch (err) {
        console.error(err);
    }
}