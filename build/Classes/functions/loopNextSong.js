"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @description finds the song again to ensure it exists then sets a constant
 * to the song in front of the queue and pushes that song to the back, which makes a looped song queue
 */
async function loopNextSong() {
    const serverQueue = this;
    await serverQueue.getVideo();
    if (serverQueue.shuffle === true) {
        const currentsong = serverQueue.shuffledSongs[0];
        serverQueue.shuffledSongs.shift();
        serverQueue.shuffledSongs.push(currentsong);
        serverQueue.play();
    }
    else {
        const currentsong = serverQueue.songs[0];
        serverQueue.songs.shift();
        serverQueue.songs.push(currentsong);
        serverQueue.play();
    }
}
exports.default = loopNextSong;
