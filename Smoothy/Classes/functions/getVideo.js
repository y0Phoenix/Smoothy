"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const play_dl_1 = __importDefault(require("play-dl"));
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
        else if (serverQueue.shuffle === true &&
            serverQueue.loop === false) {
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
        videoURL = await play_dl_1.default.video_info(videoName);
    }
    else {
        videoURL = await (0, executive_1.videoFinder)(videoName);
    }
    if (serverQueue.currentsong.length > 0) {
        serverQueue.currentsong.shift();
    }
    console.log(`Found ${videoURL.video_details.title}`);
    const songObj = new Song_1.Song({ message: message, data: videoURL });
    serverQueue.currentsong.push(songObj);
    (0, modules_1.writeGlobal)('update queue', serverQueue, message.guild.id);
}
exports.default = getVideo;
