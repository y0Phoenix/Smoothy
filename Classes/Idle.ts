import { Client, Message } from 'discord.js';
import {queue, DisconnectIdle} from '../main';


export default class Idle {
    message: Message
    id: number
    client: Client
    disconnectTimer: any
    msgs: []
    queueMsgs: []
}