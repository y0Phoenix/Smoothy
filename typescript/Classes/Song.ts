import WriteMessage from "./WriteMessage";
import { Message } from "discord.js";
import InfoData from "../interfaces/_InfoData";
import {Item} from "../interfaces/_Playlist";

export interface _newSong {
    message: Partial<Message>;
    data: InfoData;
}

export interface _newPlaylistSong {
    message: Partial<Message>;
    playlist: Item;
}

export interface _newWriteSong {
    message: Partial<Message>;
    data: Partial<Song>;
}


export class Song {
    videoURL: InfoData;
    url: InfoData["videoDetails"]["video_url"];
    title: InfoData["videoDetails"]["title"];
    thumbnail: any;
    message: Partial<Message>;
    duration: string;
    durationS: number;
    playlistsong: boolean = false;
    constructor (data: _newSong) {
        function durationCheck(dur: string) {
            let totalseconds = parseInt(dur);
            let minutes: any = Math.floor(totalseconds / 60);
            let Seconds = Math.abs(minutes * 60 - totalseconds);
            let _seconds;
            if (Seconds < 10) {
              _seconds = `0${Seconds}`;
            } else {
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
              } else {
                return `${hours}:${minutes}:${_seconds}`;
              }
            } else {
              return `${minutes}:${_seconds}`;
            }
          }
        this.videoURL = {...data.data};
        this.url = data.data.videoDetails.video_url;
        this.title = data.data.videoDetails.title;
        this.thumbnail = data.data.videoDetails.thumbnails[3].url;
        this.message = data.message;
        this.duration = durationCheck(data.data.videoDetails.lengthSeconds);
        this.durationS = parseInt(data.data.videoDetails.lengthSeconds) * 1000;
    }
}
export class PlaylistSong {
    videoURL: InfoData = null;
    url: Item["url"];
    title: Item["title"];
    thumbnail: Item["bestThumbnail"]["url"];
    message: Partial<Message>;
    duration: Item["duration"];
    durationS: Item["durationSec"];
    playlistsong: boolean = false;
    constructor (data: _newPlaylistSong) {
        this.url = data.playlist.url;
        this.title = data.playlist.title;
        this.thumbnail = data.playlist.bestThumbnail.url;
        this.message = data.message;
        this.duration = data.playlist.duration;
        this.durationS = data.playlist.durationSec;
    }
}

export class WriteSong {
    title: Song["title"];
    url: Song["url"];
    message: WriteMessage;
    duration: Song["duration"];
    durationS: Song["durationS"];
    thumbnail: Song["thumbnail"];
    constructor (data: _newWriteSong) {
        this.title = data.data.title;
        this.url = data.data.url;
        this.message = new WriteMessage(data.message);
        this.duration = data.data.duration;
        this.durationS = data.data.durationS;
        this.thumbnail = data.data.thumbnail;
    }
}