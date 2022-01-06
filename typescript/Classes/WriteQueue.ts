import { AudioPlayer, AudioResource, PlayerSubscription, VoiceConnection } from "@discordjs/voice";
import { Message } from "discord.js";
import Queue from "./Queue";
import WriteMessage from "./WriteMessage";
import { Song, WriteSong} from "./Song";

export default class WriteQueue {
    message: WriteMessage;
    id: string;
    voiceChannel: Message["member"]["voice"]["channel"];
    voiceConnection: VoiceConnection = null;
    songs: Partial<WriteSong>[];
    shuffledSongs: Partial<WriteSong>[];
    currentsong: Partial<WriteSong>[];
    jump: number = 0;
    tries: number = 0;
    audioPlayerErr: boolean;
    player: AudioPlayer = null;
    subscription: PlayerSubscription = null;
    previous: Partial<WriteSong>[];
    previousbool: boolean;
    resource: AudioResource = null;
    messagesent: boolean;
    nowPlaying: Message = null;
    nowPlayingTimer: any = null;
    shuffle: boolean;
    loop: boolean;
    loopsong: boolean;
    repeat: boolean;
    bool: boolean;
    constructor(data: Queue) {
        this.message = new WriteMessage(data.message);
        this.id = this.message.guild.id;
        this.voiceChannel = data.message.member.voice.channel;
        this.currentsong = [];
        this.songs = [];
        this.shuffledSongs = [];
        this. previous = [];
        for (let i = 0; i < data.songs.length; i++) {
            if (data.shuffledSongs[i]) {
                const shuffledSong = new WriteSong({message: data.shuffledSongs[i].message, data: data.shuffledSongs[i]});
                this.shuffledSongs.push(shuffledSong);
            }
            if (data.currentsong[i]) {
                const currentsong = new WriteSong({message: data.currentsong[i].message, data: data.currentsong[i]});
                this.currentsong.push(currentsong);
            }
            if (data.previous[i]) {
                const previous = new WriteSong({message: data.previous[i].message, data: data.previous[i]});
                this.previous.push(previous);
            }
            const song = new WriteSong({message: data.songs[i].message, data: data.songs[i]});
            this.songs.push(song);
        }
        this.shuffle = data.shuffle;
        this.loop = data.loop;
        this.loopsong = data.loopsong;
        this.repeat = data.repeat;
        this.bool = data.bool;
    }
}