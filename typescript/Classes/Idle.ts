import { Client, Message } from 'discord.js';
import WriteMessage from "./WriteMessage";

interface _newIdle {
    message: Message,
    client: Client,
    msgs: Partial<Message>[],
    queueMsgs: Partial<Message>[]
}
export class WriteIdle {
    message: Message
    id: string
    client: Client
    disconnectTimer: any = null
    msgs: Partial<WriteMessage>[]
    queueMsgs: Partial<WriteMessage>[]
    constructor (data: _newIdle) {
        this.message = data.message;
        this.id = data.message.id;
        this.client = data.client;
        if (!data.msgs) {
        }
        else {
            data.msgs.forEach(msg => {
                this.msgs.push(new WriteMessage(msg));
            });
            data.queueMsgs.forEach(msg => {
                this.queueMsgs.push(new WriteMessage(msg));
            });
        }
    }
}
export class Idle {
    message: Message
    id: string
    client: Client
    disconnectTimer: any
    msgs: Partial<Message>[]
    queueMsgs: Partial<Message>[]
    constructor (data: _newIdle) {
        this.message = data.message;
        this.id = data.message.guild.id;
        this.client = data.client;
    }
}