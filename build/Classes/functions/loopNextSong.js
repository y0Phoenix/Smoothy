"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getVideo_1 = require("./getVideo");
const findSplice_1 = require("./findSplice");
const play_1 = require("./play");
/**
 * @param  {any} queue the map that hold all of the serverQueues
 * @param  {any} DisconnectIdle the map that hold of the Idles
 * @param  {Idle} serverDisconnectIdle the current servers Idle
 * @description finds the song again to ensure it exists then sets a constant
 * to the song in front of the queue and pushes that song to the back, which makes a looped song queue
 */
async function loopNextSong(queue, DisconnectIdle, serverDisconnectIdle) {
    const serverQueue = this;
    await (0, getVideo_1.default)(serverQueue);
    if (serverQueue.shuffle === true) {
        const currentsong = serverQueue.shuffledSongs[0];
        (0, findSplice_1.default)(currentsong);
        serverQueue.shuffledSongs.shift();
        serverQueue.shuffledSongs.push(currentsong);
        (0, play_1.default)(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
    }
    else {
        const currentsong = serverQueue.songs[0];
        serverQueue.songs.shift();
        serverQueue.songs.push(currentsong);
        (0, play_1.default)(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
    }
}
exports.default = loopNextSong;
