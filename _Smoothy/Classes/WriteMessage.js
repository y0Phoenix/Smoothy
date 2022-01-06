"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WriteMessage {
    constructor(message) {
        this.guild.id = message.guild.id;
        this.author.id = message.author.id;
        this.channel.id = message.channel.id;
        this.id = message.id;
    }
}
exports.default = WriteMessage;
