"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WriteMessage {
    guild;
    author;
    channelId;
    id;
    constructor(message) {
        this.guild = { id: message.guild.id };
        this.author = { id: message.guild.id };
        this.channelId = message.channelId;
        this.id = message.id;
    }
}
exports.default = WriteMessage;
