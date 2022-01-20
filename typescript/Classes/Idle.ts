import { Client, Message, MessageEmbed } from 'discord.js';
import WriteMessage from "./WriteMessage";
import { leave } from '../modules/modules';
import getMaps from '../maps';
import * as playdl from 'play-dl';
import * as ytsearch from 'yt-search';
import { disconnectTimervcidle, disconnectvcidle } from './functions/disconnectIdle';

export class WriteIdle {
    message: WriteMessage
    id: string
    client: Client
    disconnectTimer: any = null
    msgs: Partial<WriteMessage>[] = []
    queueMsgs: Partial<WriteMessage>[] = []
    top5Msg: Message = null
    top5Results: Partial<playdl.YouTubeVideo[]> | Partial<ytsearch.SearchResult[]> = []
    disconnectvcidle: typeof disconnectvcidle = null
    disconnectTimervcidle: typeof disconnectTimervcidle = null
    constructor (data) {
        this.message = new WriteMessage(data.message);
        this.id = data.message.guild.id;
        this.client = null;
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
    msgs: Partial<Message>[] = []
    queueMsgs: Partial<Message>[] = []
    top5Msg: Message = null
    top5Results: Partial<playdl.YouTubeVideo[]> | Partial<ytsearch.SearchResult[]> = []
    disconnectvcidle: typeof disconnectvcidle
    disconnectTimervcidle: typeof disconnectTimervcidle
    constructor (data) {
        this.message = data.message;
        this.id = data.message.guild.id;
        this.client = data.client;
        this.disconnectTimervcidle = disconnectTimervcidle;
        this.disconnectvcidle = disconnectvcidle;
    }
}