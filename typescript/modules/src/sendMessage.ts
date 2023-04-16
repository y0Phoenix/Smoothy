import { EmbedBuilder, Message, MessagePayload } from "discord.js";
import getMaps from "../../maps";

interface EmbedMsg {
    embeds: EmbedBuilder[]
}

type Msg = string | EmbedMsg;

export default function sendMessage(msg: Msg, message: Partial<Message>) {
    const {DisconnectIdle} = getMaps();
    const client = DisconnectIdle.get(1);
    if (!client) return;
    const channel = client.channels.cache.get(message.channel.id);
    if (!channel) return;
    try {
        return channel.send(msg);
    } catch {
        console.warn("Failed To Send Message To Channel");
    }
}
