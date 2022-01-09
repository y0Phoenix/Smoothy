"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class guildId {
    constructor(id) {
        this.id = id;
    }
}
;
class authId {
    constructor(id) {
        this.id = id;
    }
}
class WriteMessage {
    constructor(message) {
        this.guild = new guildId(message.guild.id);
        this.author = new authId(message.author.id);
        this.channelId = message.channelId;
        this.id = message.id;
    }
}
exports.default = WriteMessage;
