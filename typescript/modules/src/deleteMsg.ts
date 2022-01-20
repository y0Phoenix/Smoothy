import { Message, Client } from "discord.js";

/**
 * @param  {} message the message to delete 
 * @param  time number needed for the amount of time before a message delete defaults to 30 sec
 * @param client the discord client in order to fetch the messages to check if they were deleted
 */
export default async function deleteMsg(message: Message | Partial<Message>, time: number, client: Client) {
    if (!message) {
        return;
    }
    const getMSG = async () => {
        try {
            const channel: any = await client.channels.fetch(message.channel.id);
            const msg: Message = await channel.messages.fetch(message.id);
            return msg;    
        } catch (error) {
            console.log('MSG Not found at deleteMSG');
        }
    }
    if (!time || isNaN(time)) {
        if (time === 0) {
            try {
                const msg = await getMSG();
                if (msg.deletable) {
                    await msg.delete();
                }
                else {
                    console.log(`MSG isnt deletable at deleteMsg ${msg.embeds[0].description}`);
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
    else {
        setTimeout( async () => { 
            try {
                const msg = await getMSG();
                if (!msg.deletable) {
                    console.log(`MSG isnt deletable at deleteMsg ${msg.embeds[0].description}`);
                    return;
                }
                await msg.delete() 
            } catch (error) {
                console.log('Unkown MSG at deleteMSG');
            }
        }, time);
    }
}