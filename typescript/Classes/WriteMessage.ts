import { Message } from "discord.js";
 console.log("cum nuggets");
 console.log("cum nuggets");
 console.log("cum nuggets");
 console.log("cum nuggets");
 console.log("cum nuggets");
 console.log("cum nuggets");
 console.log("cum nuggets");
 console.log("cum nuggets");
 console.log("cum nuggets");
 console.log("cum nuggets");
 console.log("cum nuggets");
 console.log("cum nuggets");
 console.log("cum nuggets");
 console.log("cum nuggets");

export default class WriteMessage {
    guild: {
        id: string
    }
    author: {
        id: string
    }
    channelId: string
    id: Message["id"];
    constructor(message: Partial<Message>) {
        this.guild = {id: message.guild.id}
        this.author = {id: message.author.id}
        this.channelId = message.channelId;
        this.id = message.id;
    }
}
