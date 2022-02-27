"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WriteMessage_1 = require("./WriteMessage");
const Song_1 = require("./Song");
class WriteQueue {
    message;
    id;
    voiceChannel;
    voiceConnection = null;
    songs;
    shuffledSongs;
    currentsong;
    jump = 0;
    tries = 0;
    audioPlayerErr = false;
    player = null;
    subscription = null;
    previous;
    previousbool;
    resource = null;
    messagesent;
    nowPlaying = null;
    nowPlayingTimer = null;
    shuffle;
    loop;
    loopsong;
    repeat;
    bool;
    constructor(data) {
        this.message = new WriteMessage_1.default(data.message);
        this.id = this.message.guild.id;
        this.voiceChannel = data.message.member.voice.channel;
        this.currentsong = [];
        this.songs = [];
        this.shuffledSongs = [];
        this.previous = [];
        if (data.nowPlaying) {
            this.nowPlaying = new WriteMessage_1.default(data.nowPlaying);
        }
        for (let i = 0; i < data.songs.length; i++) {
            if (data.shuffledSongs[i]) {
                const shuffledSong = new Song_1.WriteSong({ message: data.shuffledSongs[i].message, data: data.shuffledSongs[i] });
                this.shuffledSongs.push(shuffledSong);
            }
            if (data.currentsong[i]) {
                const currentsong = new Song_1.WriteSong({ message: data.currentsong[i].message, data: data.currentsong[i] });
                this.currentsong.push(currentsong);
            }
            if (data.previous[i]) {
                const previous = new Song_1.WriteSong({ message: data.previous[i].message, data: data.previous[i] });
                this.previous.push(previous);
            }
            const song = new Song_1.WriteSong({ message: data.songs[i].message, data: data.songs[i] });
            this.songs.push(song);
        }
        this.shuffle = data.shuffle;
        this.loop = data.loop;
        this.loopsong = data.loopsong;
        this.repeat = data.repeat;
        this.bool = data.bool;
    }
}
exports.default = WriteQueue;
