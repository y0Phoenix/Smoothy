import { Message } from "discord.js";
import InfoData from "./_InfoData";

export default interface _Song {
    videoURL: InfoData,
    url: InfoData["video_details"]["url"],
    title: InfoData["video_details"]["title"],
    thumbnail: any,
    message: Message,
    args: [],
    duration: string,
    durationS: number,
    playlistsong: boolean,
  };