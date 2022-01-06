import { Message } from "discord.js";

class guildId {
    id: string
    constructor(id) {
        this.id = id;
    }
};
class authId {
    id: string
    constructor(id) {
        this.id = id;
    }
}
class channelId {
    id:string
    constructor(id) {
        this.id = id;
    }
}

export default class WriteMessage {
    guild: guildId
    author: authId
    channel: channelId
    id: Message["id"];
    constructor(message: Partial<Message>) {
        this.guild = new guildId(message.guild.id);
        this.author = new authId(message.author.id);
        this.channel = new channelId(message.channel.id);
        this.id = message.id;
    }
}