"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WriteMessage_1 = require("./WriteMessage");
const Song_1 = require("./Song");
class WriteQueue {
    constructor(data) {
        this.voiceConnection = null;
        this.jump = 0;
        this.tries = 0;
        this.player = null;
        this.subscription = null;
        this.resource = null;
        this.nowPlaying = null;
        this.nowPlayingTimer = null;
        this.message = new WriteMessage_1.default(data.message);
        this.id = this.message.guild.id;
        this.voiceChannel = data.message.member.voice.channel;
        for (let i = 0; i < data.songs.length; i++) {
            if (data.shuffledSongs[i]) {
                const shuffledSong = new Song_1.WriteSong({ message: data.shuffledSongs[i].message, data: data.shuffledSongs[i] });
                this.shuffledSongs.push(shuffledSong);
            }
            if (data.currentsong[i]) {
                const currentsong = new Song_1.WriteSong({ message: data.shuffledSongs[i].message, data: data.shuffledSongs[i] });
                this.currentsong.push(currentsong);
            }
            if (data.previous[i]) {
                const previous = new Song_1.WriteSong({ message: data.shuffledSongs[i].message, data: data.shuffledSongs[i] });
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
