import { Message } from "discord.js";

export default class WriteMessage {
    guild: {
        id: null; 
    };
    author: {
        id: null;
    };
    channel: {
        id: null
    } 
    id: Message["id"];
    constructor(message: Partial<Message>) {
        this.guild.id = message.guild.id;
        this.author.id = message.author.id;
        this.channel.id = message.channel.id;
        this.id = message.id;
    }
}