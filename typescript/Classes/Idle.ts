import { Client, Message } from 'discord.js';
import WriteMessage from "./WriteMessage";
import getMaps from '../maps';
import * as playdl from 'play-dl';
import * as ytsearch from 'yt-search';
import { disconnectTimervcidle, disconnectvcidle } from './functions/disconnectIdle';
import { AudioPlayerStatus, entersState, getVoiceConnection, VoiceConnection } from '@discordjs/voice';
import { joinvoicechannel } from '../executive';
import { exists, leave } from '../modules/modules';
import { VoiceConnectionStatus } from '@discordjs/voice';

export class WriteIdle {
    message: WriteMessage
    id: string
    client: Client
    disconnectTimer: any = null
    msgs: Partial<WriteMessage>[] = []
    queueMsgs: Partial<WriteMessage>[] = []
    top5Msg: Message = null
    top5Results: Partial<playdl.YouTubeVideo[]> | Partial<ytsearch.SearchResult[]> = []
    tries: number = 0
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
    voiceConnection: VoiceConnection = null;
    msgs: Partial<Message>[] = []
    queueMsgs: Partial<Message>[] = []
    top5Msg: Message = null
    top5Results: Partial<playdl.YouTubeVideo[]> | Partial<ytsearch.SearchResult[]> = []
    tries: number = 0;
    disconnectvcidle: typeof disconnectvcidle
    disconnectTimervcidle: typeof disconnectTimervcidle
    constructor (data) {
        this.message = data.message;
        this.id = data.message.guild.id;
        this.client = data.client;
        this.disconnectTimervcidle = disconnectTimervcidle;
        this.disconnectvcidle = disconnectvcidle;
        this.voiceConnection = getVoiceConnection(this.id);
        const {DisconnectIdle} = getMaps();
        if (!this.voiceConnection) {
            const join = async () => {
                const bool = await exists(this.id, 'dci')
                this.voiceConnection = await joinvoicechannel(this.message, this.message.member.voice.channel, DisconnectIdle, DisconnectIdle.get(this.id), DisconnectIdle.get(1), bool);
            };
            join();
        }
        this.voiceConnection.on(VoiceConnectionStatus.Disconnected, async () => {
            const str = `\nServer: ${this.message.guild.name}\nAuthor: ${this.message.author.username}`;
            console.log(`Disconnect State Detected Checking If Valid For${str}`);
            try {
                await Promise.race([
                    entersState(this.voiceConnection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(this.voiceConnection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
                // Seems to be reconnecting to a new channel - ignore disconnect
                console.log(`Asserted Disconnect As Valid For${str}`);
            } catch (error) {
                // Seems to be a real disconnect which SHOULDN'T be recovered from
                console.log(`Asserted Disconnect As Invalid For ${str}`);
                leave(this.message);
            }
        })
    }
}
