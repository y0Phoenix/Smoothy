import { Message } from "discord.js";

/**
 * @param  {} message the message to delete 
 * @param  time number needed for the amount of time before a message delete defaults to 30 sec
 * @param client the discord client in order to fetch the messages to check if they were deleted
 */
export default async function deleteMsg(message: Message | Partial<Message>, time: number, client: any) {
    if (!time || isNaN(time)) {
        time = 30000;
    }
    if (!message) {
        return;
    }
    else {
        setTimeout( async () => { 
            const channel = await client.channels.fetch(message.channel.id);
            const msg: Message = await channel.messages.fetch(message.id);
            if (msg.deleted === true) {
                return;
            }
            await msg.delete() 
        }, time);
    }
}