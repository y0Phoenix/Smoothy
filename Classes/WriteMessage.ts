import { Message } from "discord.js";

export default class WriteMessage {
    guildId: Message["guildId"];
    author: {
        id: Message["author"]["id"]
    };
    channelId: Message["channelId"];
    id: Message["id"];
    constructor(message: Partial<Message>) {
        this.guildId = message.guildId;
        this.author.id = message.author.id;
        this.channelId = message.channelId;
        this.id = message.id;
    }
}