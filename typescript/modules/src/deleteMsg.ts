import { Message } from "discord.js";

/**
 * @param  {} message the message to delete 
 * @param  time number needed for the amount of time before a message delete defaults to 30 sec
 * @param client the discord client in order to fetch the messages to check if they were deleted
 */
export default async function deleteMsg(message: Message | Partial<Message>, time: number, client: any) {
    const getMSG = async () => {
        const channel = await client.channels.fetch(message.channel.id);
        const msg: Message = await channel.messages.fetch(message.id);
        return msg;    
    }
    if (!time || isNaN(time)) {
        if (time === 0) {
            try {
                const msg = await getMSG();
                if (msg.deletable) {
                    msg.delete();
                }
                else {
                    console.log('MSG isnt deletable at deleteMsg');
                    return
                }    
            } catch (error) {
                console.log('Unkown MSG at deleteMSG');
            }
        }
        else {
            time = 30000;
        }
    }
    if (!message) {
        return;
    }
    else {
        setTimeout( async () => { 
            try {
                const msg = await getMSG();
                if (msg.deletable === true) {
                    console.log('MSG isnt deletable at deleteMsg');
                    return;
                }
                await msg.delete() 
            } catch (error) {
                console.log('Unkown MSG at deleteMSG');
            }
        }, time);
    }
}