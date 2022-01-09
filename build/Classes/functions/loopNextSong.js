"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getVideo_1 = require("./getVideo");
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
        serverQueue.findSplice(currentsong);
        serverQueue.shuffledSongs.shift();
        serverQueue.shuffledSongs.push(currentsong);
        serverQueue.play(queue, DisconnectIdle, serverDisconnectIdle);
    }
    else {
        const currentsong = serverQueue.songs[0];
        serverQueue.songs.shift();
        serverQueue.songs.push(currentsong);
        serverQueue.play(queue, DisconnectIdle, serverDisconnectIdle);
    }
}
exports.default = loopNextSong;
