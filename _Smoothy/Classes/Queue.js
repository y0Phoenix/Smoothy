"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Queue {
    constructor(msg) {
        this.songs = [];
        this.shuffledSongs = [];
        this.currentsong = [];
        this.jump = 0;
        this.tries = 0;
        this.audioPlayerErr = false;
        this.player = null;
        this.subsciption = null;
        this.previous = [];
        this.previousbool = false;
        this.messagesent = false;
        this.nowPlaying = null;
        this.nowPlayingTimer = null;
        this.shuffle = false;
        this.loop = false;
        this.loopsong = false;
        this.repeat = false;
        this.bool = false;
        this.jumpbool = false;
        this.message = msg;
        this.id = msg.guild.id;
        this.voiceChannel = msg.member.voice.channel;
    }
}
exports.default = Queue;
