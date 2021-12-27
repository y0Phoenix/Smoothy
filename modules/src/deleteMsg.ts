import { Message } from "discord.js";
import { DisconnectIdle } from "../../main";

/**
 * @param  {} message the message to delete 
 * @param  time number needed for the amount of time before a message delete defaults to 30 sec
 */
export default async function deleteMsg(message: Message | Partial<Message>, time: number) {
    if (!time || isNaN(time)) {
        time = 30000;
    }
    if (!message) {
        return;
    }
    else {
        setTimeout( async () => { 
            const Idle = DisconnectIdle.get(message.guild.id);
            const channel = await Idle.client.channels.fetch(message.channel.id);
            const msg: Message = await channel.messages.fetch(message.id);
            if (msg.deleted === true) {
                return;
            }
            await msg.delete() 
        }, time);
    }
}