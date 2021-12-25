import { AudioPlayer, PlayerSubscription } from "@discordjs/voice";
import { Message } from "discord.js";

export default interface _Queue {
    message: Message,
    id : string,
    voiceChannel: any,
    songs: [],
    shuffledSongs: [],
    currentsong: [],
    jump: number,
    tries: number,
    audioPlayerError: boolean,
    player: AudioPlayer,
    subsciption: PlayerSubscription,
    previous: [],
    previousbool: boolean,
    messagesent: boolean,
    nowPlaying: Message,
    nowPlayingTimer: any,
    shuffle: boolean,
    loop: boolean,
    loopsong: boolean,
    repeat: boolean,
    playlist: boolean,
    bool: boolean
};

