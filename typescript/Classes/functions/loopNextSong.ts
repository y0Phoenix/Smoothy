import { Idle } from "../Idle";
import Queue from "../Queue";
import getVideo from "./getVideo";
import findSplice from "./findSplice";
import play from "./play";

/**
 * @param  {any} queue the map that hold all of the serverQueues
 * @param  {any} DisconnectIdle the map that hold of the Idles
 * @param  {Idle} serverDisconnectIdle the current servers Idle
 * @description finds the song again to ensure it exists then sets a constant 
 * to the song in front of the queue and pushes that song to the back, which makes a looped song queue
 */
 export default async function loopNextSong(
    queue: any,
    DisconnectIdle: any,
    serverDisconnectIdle: Idle
  ) {
    const serverQueue: Queue = this;
    await getVideo(serverQueue);
    if (serverQueue.shuffle === true) {
      const currentsong = serverQueue.shuffledSongs[0];
      findSplice(currentsong);
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