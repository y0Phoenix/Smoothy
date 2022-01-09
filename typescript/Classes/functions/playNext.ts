import getVideo from "./getVideo";
import { Idle } from "../Idle";

/**
 * @param  {any} queue the map that holds all of the serverQueues
 * @param  {any} DisconnectIdle the map that hold all of the Idles
 * @param  {Idle} serverDisconnectIdle the current servers Idle
 * @description searches for the song again to ensure it exists then plays that song at the play function
 * somewhat of a middleware function
 */
 export default async function playNext(queue: any, DisconnectIdle: any, serverDisconnectIdle: Idle) {
    await getVideo(this);
    this.play(queue, DisconnectIdle, serverDisconnectIdle);
}