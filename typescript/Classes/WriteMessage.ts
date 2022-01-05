import { Message } from "discord.js";

export default class WriteMessage {
    guild: {
        id: Partial<Message>["guild"]["id"]
    };
    author: {
        id: Partial<Message>["author"]["id"]
    };
    channel: {
        id: Partial<Message>["channel"]["id"]
    } 
    id: Message["id"];
    constructor(message: Partial<Message>) {
        this.guild.id = message.guild.id;
        this.author.id = message.author.id;
        this.channel.id = message.channel.id;
        this.id = message.id;
    }
}