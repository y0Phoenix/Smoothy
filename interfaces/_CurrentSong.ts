import { Message } from "discord.js";
import InfoData from "./_InfoData";

export default interface _CurrentSong {
    videoURL: InfoData,
    title: InfoData["video_details"]["title"],
    url: InfoData["video_details"]["url"],
    thumbnail: string,
    message: Message,
    duration: string,
    durationS: number,
    load: boolean
  };