import playdl from 'play-dl';
import { distance, deleteMsg, leave, topResult } from '../../modules/modules';
import { AudioPlayerStatus } from '@discordjs/voice';
import { MessageEmbed } from 'discord.js';
import Queue from '../Queue';
import {Idle} from '../Idle';
import getVideo from './getVideo'
import play from './play';
import {Song} from '../Song';
import InfoData from '../../interfaces/_InfoData';
import embedSend from '../../functions/embed';

/**
 *@param  {} queue the map that holds all of the serverQueues
 * @param  {} DisconnectIdle the map that holds all of the servers Idles
 * @param  {} serverDisconnectIdle the current servers Idle
 * @description //disconnects from voiceConnection after 1800000 ms or 30 min
 */
export function disconnectvcidle(queue: any, DisconnectIdle: any, serverDisconnectIdle: Idle) {
  const vcIdleEmbed = new MessageEmbed()
    .setColor('RED')
    .setDescription(':cry: Left VC Due To Idle');
  embedSend(serverDisconnectIdle.message, vcIdleEmbed, 60000);
  console.log(`Left VC Due To Idle`);
  leave(queue, DisconnectIdle, serverDisconnectIdle.message);
}

/**
 * @param  {} queue the map that holds all of the serverQueues
 * @param  {} DisconnectIdle the map that holds all of the servers Idles
 * @param  {} serverDisconnectIdle the current servers Idle
 * @description//starts the timer for 1800000 ms or 30 min which disconnects from voiceConnection
 * this timer only starts when the audioPlayer is Idle
 */
export function disconnectTimervcidle(queue: any, DisconnectIdle: any, serverDisconnectIdle: Idle) {
  serverDisconnectIdle.disconnectTimer = setTimeout(
    disconnectvcidle,
    1800000,
    queue,
    DisconnectIdle,
    serverDisconnectIdle
  );
  console.log('Starting disconnectTimer Timeout');
}

/**
 * @param  {string} q the video you wish to search
 * @returns {InfoData} the closest match to the search query
 * @description searches youtube for videos matching the search query and 
 * checks the distance between both strings and returns the closest match
 */
export const videoFinder = async (q: string) => {
    const videoResult = await playdl.search(q);
    if (videoResult[0]) {
      let name = q.toLowerCase();
      let _possibleVids = [];
      let vid = videoResult[0].title.toLowerCase();
      let includes = vid.includes(name);
      if (includes === true) {
        return videoResult[0];
      } else {
        for (let i: number = 0; i < 6; i++) {
          let possibleVid = videoResult[i].title.toLowerCase();
          let dif = distance(name, possibleVid);
          _possibleVids.push({ dif: dif, video: videoResult[i] });
        }
        const returnObj = await topResult(_possibleVids); 
        return returnObj.video;
      }
    }
    return undefined;
  };
  
/**
 * @param  {string} videoName the string you wish to check
 * @returns {boolean} boolean value
 * @description uses RegExp to check the string for values inside of a valid url
 */
export function validURL(videoName: string) {
    var pattern = new RegExp(
        '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
        'i'
    ); // fragment locator
    return !!pattern.test(videoName);
}

/**
 * @param  {Queue} serverQueue the current servers queue
 * @description checks if the serverQueue is playing a song via
 * AudioPlayerStatus
 * @returns {boolean} boolean value
 */
 export async function checkIfPlaying(serverQueue: Queue) {
    if (serverQueue.player.state.status === AudioPlayerStatus.Playing) {
        return true;
    } else {
        return false;
    }
}

/**
 * @param  {Queue} serverQueue the current servers queue
 * @param  {any} queue the map that holds all of the serverQueues
 * @param  {any} DisconnectIdle the map that hold all of the Idles
 * @param  {Idle} serverDisconnectIdle the current servers Idle
 * @description searches for the song again to ensure it exists then plays that song at the play function
 * somewhat of a middleware function
 */
 export async function playNext(serverQueue: Queue, queue: any, DisconnectIdle: any, serverDisconnectIdle: Idle) {
    await getVideo(serverQueue);
    play(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
}
/**
 * @param  {Queue} serverQueue the current servers queue
 * @param  {_Song} currentsong a song object
 * @description finds the song specified in the params and removes it from the Queue 
 */
 export function findSplice(serverQueue: Queue, currentsong: any) {
    const title = currentsong.title;
    for (let i = 0; i < serverQueue.songs.length; i++) {
        if (title === serverQueue.songs[i].title) {
            if (i === 0) {
                serverQueue.songs.shift();
            } else {
                console.log(`Splicing ${serverQueue.songs[i].title} ${i}`);
                serverQueue.songs.splice(i, 1);
            }
        }
    }
}

/**
 * @param  {Queue} serverQueue the current servers queue
 * @param  {any} queue the map that hold all of the serverQueues
 * @param  {any} DisconnectIdle the map that hold of the Idles
 * @param  {Idle} serverDisconnectIdle the current servers Idle
 * @description finds the song again to ensure it exists then sets a constant 
 * to the song in front of the queue and pushes that song to the back, which makes a looped song queue
 */
 export async function loopNextSong(
    serverQueue: Queue,
    queue: any,
    DisconnectIdle: any,
    serverDisconnectIdle: Idle
  ) {
    await getVideo(serverQueue);
    if (serverQueue.shuffle === true) {
      const currentsong = serverQueue.shuffledSongs[0];
      findSplice(serverQueue, currentsong);
      serverQueue.shuffledSongs.shift();
      serverQueue.shuffledSongs.push(currentsong);
      play(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
    } else {
      const currentsong = serverQueue.songs[0];
      serverQueue.songs.shift();
      serverQueue.songs.push(currentsong);
      play(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
    }
}
