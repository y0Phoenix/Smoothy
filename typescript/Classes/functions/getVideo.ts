import { Message } from "discord.js";
import InfoData from "../../interfaces/_InfoData";
import * as ytdl from 'ytdl-core';
import playdl from 'play-dl';
import Queue from "../Queue";
import {writeGlobal} from '../../modules/modules';
import {videoFinder, validURL, findSplice} from './executive';
import { Song } from "../Song";

//finds the song specified in args
/**
 * @param  {Queue} serverQueue the current servers queue
 */
export default async function getVideo(serverQueue: Queue) {
    let message: Partial<Message>;
    let videoName: string;
    let videoURL: InfoData;
    let i = serverQueue.jump;
    if (serverQueue.previousbool) {
      videoName = serverQueue.previous[0].url;
      message = serverQueue.previous[0].message;
      serverQueue.previousbool = false;
    }
    else if (i > 0) {
        serverQueue.jumpbool = true;
        const song = serverQueue.shuffle ? serverQueue.shuffledSongs[i] : serverQueue.songs[i];
        videoName = song.title;
        message = song.message;
        if (serverQueue.shuffle) {
          serverQueue.shuffledSongs.splice(i, 1);
          findSplice(serverQueue, song)
        }
        else {
          serverQueue.songs.splice(i, 1);
        }
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
      videoURL = await ytdl.getBasicInfo(videoName);
    } else {
      const video = await videoFinder(videoName);
      videoURL = await ytdl.getBasicInfo(video.url)
    }
    if (serverQueue.currentsong.length > 0) {
      serverQueue.currentsong.shift();
    }
    console.log(`Found ${videoURL.videoDetails.title}`);
    const songObj = new Song({message: message, data: videoURL});
    serverQueue.currentsong.push(songObj);
    writeGlobal('update queue', serverQueue, message.guild.id);
  }