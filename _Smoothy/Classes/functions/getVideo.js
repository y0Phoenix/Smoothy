"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ytdl_core_1 = require("ytdl-core");
const modules_1 = require("../../modules/modules");
const executive_1 = require("./executive");
const Song_1 = require("../Song");
//finds the song specified in args
/**
 * @param  {Queue} serverQueue the current servers queue
 */
async function getVideo(serverQueue) {
    let message;
    let videoName;
    let videoURL;
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
            (0, executive_1.findSplice)(serverQueue, song);
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
        else if (serverQueue.shuffle === true &&
            serverQueue.loop === true) {
            videoName = serverQueue.shuffledSongs[1].url;
            message = serverQueue.shuffledSongs[1].message;
        }
        else if (serverQueue.shuffle === true &&
            serverQueue.loop === false) {
            videoName = serverQueue.shuffledSongs[0].url;
            message = serverQueue.shuffledSongs[0].message;
        }
        else if (serverQueue.loop === true &&
            serverQueue.shuffle === false &&
            serverQueue.songs.length > 1) {
            videoName = serverQueue.songs[0].url;
            message = serverQueue.songs[0].message;
        }
        else if (serverQueue.jump > 0) {
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
    let URL = (0, executive_1.validURL)(videoName);
    if (URL === true) {
        videoURL = await ytdl_core_1.default.getBasicInfo(videoName);
    }
    else {
        const video = await (0, executive_1.videoFinder)(videoName);
        videoURL = await ytdl_core_1.default.getBasicInfo(video.url);
    }
    if (serverQueue.currentsong.length > 0) {
        serverQueue.currentsong.shift();
    }
    console.log(`Found ${videoURL.videoDetails.title}`);
    const songObj = new Song_1.Song({ message: message, data: videoURL });
    serverQueue.currentsong.push(songObj);
    (0, modules_1.writeGlobal)('update queue', serverQueue, message.guild.id);
}
exports.default = getVideo;
