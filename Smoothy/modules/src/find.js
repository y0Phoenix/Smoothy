"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const distance_1 = __importDefault(require("./distance"));
/**
 * @param  {} queue the object that is the serverQueue with the songs
 * @param  {} query the song you wish to find
 * @returns an object with three params song, shuffledSong (null if the queue isn't shuffled), and error (if no good match was found, false if a match is found)
 * @returns null if an error occurred
 */
async function find(queue, query) {
    const options = [];
    const returnObj = {
        song: null,
        shuffledSong: null,
        error: false
    };
    let proceed = true;
    let result;
    const shuffle = queue.shuffle ? true : false;
    if (!shuffle) {
        returnObj.shuffledSong = null;
    }
    let arr = queue.shuffle ? [...queue.shuffledSongs] : [...queue.songs];
    try {
        for (let j = 0; j < arr.length; j++) {
            const bool = arr[j].title.toLowerCase().includes(query);
            if (bool) {
                returnObj.song = queue.songs.map(video => video.title).indexOf(arr[j].title);
                if (shuffle) {
                    returnObj.shuffledSong = arr.map(video => video.title).indexOf(arr[j].title);
                }
                proceed = false;
                break;
            }
            else {
                let dif = (0, distance_1.default)(query, arr[j].title);
                options.push({ dif: dif, video: arr[j] });
            }
        }
        if (proceed) {
            returnObj.error = true;
            // todo imporve distance algorithm to make this code viable
            // result = topResult(options);
            // returnObj.song = queue.songs.map(video => video.title).indexOf(result.video.title);
            // if (shuffle) {
            //     returnObj.shuffledSong = queue.shuffledSongs.map(video => video.title).indexOf(result.video.title);
            // }
        }
        return returnObj;
    }
    catch (err) {
        console.error(err);
        return null;
    }
}
exports.default = find;
