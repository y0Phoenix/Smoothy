import { Message } from "discord.js";

class guildId {
    id: string
    constructor(id: string) {
        this.id = id;
    }
};
class authId {
    id: string
    constructor(id: string) {
        this.id = id;
    }
}
export default class WriteMessage {
    guild: guildId
    author: authId
    channelId: string
    id: Message["id"];
    constructor(message: Partial<Message>) {
        this.guild = new guildId(message.guild.id);
        this.author = new authId(message.author.id);
        this.channelId = message.channelId;
        this.id = message.id;
    }
}