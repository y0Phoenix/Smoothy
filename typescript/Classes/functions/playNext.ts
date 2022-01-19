import getVideo from "./getVideo";
import { Idle } from "../Idle";
import getMaps from "../../maps";

/**
 * @description searches for the song again to ensure it exists then plays that song at the play function
 * somewhat of a middleware function
 */
 export default async function playNext() {
    await this.getVideo();
    this.play();
}