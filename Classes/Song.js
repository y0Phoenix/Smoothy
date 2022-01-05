"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriteSong = exports.PlaylistSong = exports.Song = void 0;
const WriteMessage_1 = __importDefault(require("./WriteMessage"));
class Song {
    constructor(data) {
        this.playlistsong = false;
        this.videoURL = Object.assign({}, data.data);
        this.url = data.data.video_details.url;
        this.title = data.data.video_details.title;
        this.thumbnail = data.data.video_details.thumbnails[4].url;
        this.message = data.message;
        this.duration = data.data.video_details.durationRaw;
        this.durationS = data.data.video_details.durationInSec;
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
