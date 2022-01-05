declare function require(name:string);
const { AudioPlayer, PlayerSubscription } = require("@discordjs/voice");
const { Message } = require("discord.js");

export default interface _Queue {
    message: typeof Message,
    id : string,
    voiceChannel: any,
    songs: [],
    shuffledSongs: [],
    currentsong: [],
    jump: number,
    tries: number,
    audioPlayerError: boolean,
    player: typeof AudioPlayer,
    subsciption: typeof PlayerSubscription,
    previous: [],
    previousbool: boolean,
    messagesent: boolean,
    nowPlaying: typeof Message,
    nowPlayingTimer: any,
    shuffle: boolean,
    loop: boolean,
    loopsong: boolean,
    repeat: boolean,
    playlist: boolean,
    bool: boolean
};

