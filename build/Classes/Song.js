"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorSong = exports.WriteSong = exports.PlaylistSong = exports.Song = void 0;
const WriteMessage_1 = require("./WriteMessage");
class Song {
    videoURL;
    url;
    title;
    thumbnail;
    message;
    duration;
    durationS;
    playlistsong = false;
    constructor(data) {
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
        this.videoURL = { ...data.data };
        this.url = data.data.videoDetails.video_url;
        this.title = data.data.videoDetails.title;
        this.thumbnail = data.data.videoDetails.thumbnails[3].url;
        this.message = data.message;
        this.duration = durationCheck(data.data.videoDetails.lengthSeconds);
        this.durationS = parseInt(data.data.videoDetails.lengthSeconds);
    }
}
exports.Song = Song;
class PlaylistSong {
    videoURL = null;
    url;
    title;
    thumbnail;
    message;
    duration;
    durationS;
    playlistsong = false;
    constructor(data) {
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
    title;
    url;
    message;
    duration;
    durationS;
    thumbnail;
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
class ErrorSong {
    url;
    title;
    thumbnail;
    message;
    duration;
    durationS;
    playlistsong = false;
    constructor(data) {
        this.url = data.song.video_details.url;
        this.title = data.song.video_details.title;
        this.thumbnail = data.song.video_details.thumbnails[3].url;
        this.message = data.message;
        this.duration = data.song.video_details.durationRaw;
        this.durationS = data.song.video_details.durationInSec;
    }
}
exports.ErrorSong = ErrorSong;
