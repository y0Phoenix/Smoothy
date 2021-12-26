import WriteMessage from "./WriteMessage";
import { Message } from "discord.js";
import InfoData from "../interfaces/_InfoData";

export interface _newSong {
    message: Message;
    data: InfoData;
}

export interface _newWriteSong {
    message: Message;
    data: Partial<Song>;
}


export class Song {
    videoURL: InfoData;
    url: InfoData["video_details"]["url"];
    title: InfoData["video_details"]["title"];
    thumbnail: any;
    message: Message;
    duration: string;
    durationS: number;
    playlistsong: boolean = false;
    constructor (data: _newSong) {
        this.videoURL = {...data.data};
        this.url = data.data.video_details.url;
        this.title = data.data.video_details.title;
        this.thumbnail = data.data.video_details.thumbnails[4].url;
        this.message = data.message;
        this.duration = data.data.video_details.durationRaw;
        this.durationS = data.data.video_details.durationInSec;
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