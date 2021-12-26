import { Message } from "discord.js";

/**
 * @param  {} message the message to delete 
 * @param  time number needed for the amount of time before a message delete defaults to 30 sec
 */
export default async function deleteMsg(message: Message, time: number) {
    if (!time || isNaN(time)) {
        time = 30000;
    }
    if (!message) {
        return;
    }
    else {
        setTimeout( async () => { await message.delete() }, time);
    }
}