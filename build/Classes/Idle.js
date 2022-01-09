"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Idle = exports.WriteIdle = void 0;
const WriteMessage_1 = require("./WriteMessage");
class WriteIdle {
    constructor(data) {
        this.disconnectTimer = null;
        this.msgs = [];
        this.queueMsgs = [];
        this.message = data.message;
        this.id = data.message.guild.id;
        this.client = null;
        if (!data.msgs) {
        }
        else {
            data.msgs.forEach(msg => {
                this.msgs.push(new WriteMessage_1.default(msg));
            });
            data.queueMsgs.forEach(msg => {
                this.queueMsgs.push(new WriteMessage_1.default(msg));
            });
        }
    }
}
exports.WriteIdle = WriteIdle;
class Idle {
    constructor(data) {
        this.msgs = [];
        this.queueMsgs = [];
        this.message = data.message;
        this.id = data.message.guild.id;
        this.client = data.client;
    }
}
exports.Idle = Idle;
