"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriteSong = exports.PlaylistSong = exports.Song = void 0;
const WriteMessage_1 = require("./WriteMessage");
class Song {
    constructor(data) {
        this.playlistsong = false;
        function durationCheck(dur) {
            let totalseconds = parseInt(dur);
            let minutes = Math.floor(totalseconds / 60);
            let Seconds = Math.abs(minutes * 60 - totalseconds);
            let _seconds;
            if (Seconds < 10) {
                _seconds = `0${Seconds}`;
            }
            else {
                _seconds = `${Seconds}`;
            }
            let hours = Math.floor(totalseconds / 3600);
            if (hours > 0) {
                for (let i = 0; minutes > 60; i++) {
                    minutes = Math.floor(minutes - 60);
                }
                if (minutes < 10) {
                    minutes = `0${minutes}`;
                }
                if (minutes === 60) {
                    return `${hours}:00:${_seconds}`;
                }
                else {
                    return `${hours}:${minutes}:${_seconds}`;
                }
            }
            else {
                return `${minutes}:${_seconds}`;
            }
        }
        this.videoURL = Object.assign({}, data.data);
        this.url = data.data.videoDetails.video_url;
        this.title = data.data.videoDetails.title;
        this.thumbnail = data.data.videoDetails.thumbnails[4].url;
        this.message = data.message;
        this.duration = durationCheck(data.data.videoDetails.lengthSeconds);
        this.durationS = parseInt(data.data.videoDetails.lengthSeconds) * 1000;
    }
}
exports.Song = Song;
class PlaylistSong {
    constructor(data) {
        this.videoURL = null;
        this.playlistsong = false;
        this.url = data.playlist.url;
        this.title = data.playlist.title;
        this.thumbnail = data.playlist.bestThumbnail.url;
        this.message = data.message;
        this.duration = data.playlist.duration;
        this.durationS = data.playlist.durationSec;
    }
}
exports.PlaylistSong = PlaylistSong;
class WriteSong {
    constructor(data) {
        this.title = data.data.title;
        this.url = data.data.url;
        this.message = new WriteMessage_1.default(data.message);
        this.duration = data.data.duration;
        this.durationS = data.data.durationS;
        this.thumbnail = data.data.thumbnail;
    }
}
exports.WriteSong = WriteSong;
