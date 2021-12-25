import { Message } from "discord.js";
import InfoData from "../../interfaces/_InfoData";
import playdl from 'play-dl';
import Queue from "../Queue";
import {writeGlobal} from '../../modules/modules';
import {videoFinder, validURL} from './executive';

//finds the song specified in args
export default async function getVideo(serverQueue: Queue) {
    let message: Message = undefined;
    let videoName: string;
    let videoURL: InfoData;
    if (serverQueue.previousbool) {
      videoName = serverQueue.previous[0].url;
      message = serverQueue.previous[0].message;
      serverQueue.previousbool = false;
    }
    else {
      if (serverQueue.loopsong === true) {
        videoName = serverQueue.currentsong[0].url;
        message = serverQueue.currentsong[0].message;
      }
      else if (
        serverQueue.shuffle === true &&
        serverQueue.loop === true
      ) {
        videoName = serverQueue.shuffledSongs[1].url;
        message = serverQueue.shuffledSongs[1].message;
      } else if (
        serverQueue.shuffle === true &&
        serverQueue.loop === false
      ) {
          videoName = serverQueue.shuffledSongs[0].url;
          message = serverQueue.shuffledSongs[0].message;
      } 
      else if (
        serverQueue.shuffle === true &&
        serverQueue.loop === false
      ) {
        let i = serverQueue.jump;
        serverQueue.jumpbool = true;
        if (i > 0) {
            videoName = serverQueue.shuffledSongs[i].url;
            message = serverQueue.shuffledSongs[i].message;
            serverQueue.shuffledSongs.splice(i, 1);
            serverQueue.songs.splice(i, 1);
        }
        else {
            videoName = serverQueue.shuffledSongs[0].url;
            message = serverQueue.shuffledSongs[0].message;
        }
      } else if (
        serverQueue.loop === true &&
        serverQueue.shuffle === false &&
        serverQueue.songs.length > 1
      ) {
          videoName = serverQueue.songs[0].url;
          message = serverQueue.songs[0].message;
      } else if (serverQueue.jump > 0) {
          let i = serverQueue.jump;
          serverQueue.jumpbool = true;
          videoName = serverQueue.songs[i].url;
          message = serverQueue.songs[i].message;
          serverQueue.songs.splice(i, 1);
      }
      else {
          videoName = serverQueue.songs[0].url;
          message = serverQueue.songs[0].message;
      }
    }
    let URL = validURL(videoName);
    if (URL === true) {
      videoURL = await playdl.video_info(videoName);
    } else {
      videoURL = await videoFinder(videoName);
    }
    if (serverQueue.currentsong.length > 0) {
      serverQueue.currentsong.shift();
    }
    console.log(`Found ${videoURL.video_details.title}`);
    let durationS = videoURL.video_details.durationInSec;
    const songObj = {
      videoURL: videoURL,
      title: videoURL.video_details.title,
      url: videoURL.video_details.url,
      thumbnail: videoURL.video_details.thumbnails[3].url,
      message: message,
      duration: videoURL.video_details.durationRaw,
      durationS: durationS,
      load: false,
    }
    serverQueue.currentsong.push(songObj);
    writeGlobal('update queue', serverQueue, message.guildId);
  }