"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loopNextSong = exports.findSplice = exports.playNext = exports.validURL = exports.videoFinder = exports.disconnectTimervcidle = exports.disconnectvcidle = void 0;
const play_dl_1 = __importDefault(require("play-dl"));
const modules_1 = require("../../modules/modules");
const discord_js_1 = require("discord.js");
const getVideo_1 = __importDefault(require("./getVideo"));
const play_1 = __importDefault(require("./play"));
const embed_1 = __importDefault(require("../../functions/embed"));
/**
 *@param  {} queue the map that holds all of the serverQueues
 * @param  {} DisconnectIdle the map that holds all of the servers Idles
 * @param  {} serverDisconnectIdle the current servers Idle
 * @description //disconnects from voiceConnection after 1800000 ms or 30 min
 */
function disconnectvcidle(queue, DisconnectIdle, serverDisconnectIdle) {
    const vcIdleEmbed = new discord_js_1.MessageEmbed()
        .setColor('RED')
        .setDescription(':cry: Left VC Due To Idle');
    (0, embed_1.default)(serverDisconnectIdle.message, vcIdleEmbed, 60000);
    console.log(`Left VC Due To Idle`);
    (0, modules_1.leave)(queue, DisconnectIdle, serverDisconnectIdle.message);
}
exports.disconnectvcidle = disconnectvcidle;
/**
 * @param  {} queue the map that holds all of the serverQueues
 * @param  {} DisconnectIdle the map that holds all of the servers Idles
 * @param  {} serverDisconnectIdle the current servers Idle
 * @description//starts the timer for 1800000 ms or 30 min which disconnects from voiceConnection
 * this timer only starts when the audioPlayer is Idle
 */
function disconnectTimervcidle(queue, DisconnectIdle, serverDisconnectIdle) {
    serverDisconnectIdle.disconnectTimer = setTimeout(disconnectvcidle, 1800000, queue, DisconnectIdle, serverDisconnectIdle);
    console.log('Starting disconnectTimer Timeout');
}
exports.disconnectTimervcidle = disconnectTimervcidle;
/**
 * @param  {string} q the video you wish to search
 * @returns {InfoData} the closest match to the search query
 * @description searches youtube for videos matching the search query and
 * checks the distance between both strings and returns the closest match
 */
 const videoFinder = async (query) => {
    try {
      let name = query.toLowerCase();
      const videoResult = await playdl.search(name);
      const regex = /;|,|\.|>|<|'|"|:|}|{|\]|\[|=|-|_|\(|\)|&|^|%|$|#|@|!|~|`/ig;
      if (videoResult[0]) {
        let _possibleVids = [];
        let vid = videoResult[0].title.toLowerCase();
        vid = vid.replace(regex, '');
        name = name.replace(regex, '');
        const Name = name.split(' ');
        let proceed = false;
        for (let i = 0; i < Name.length; i++) {
          const re = new RegExp(Name[i], 'g');
          const includes = re.test(vid);
          if (!includes) {
            proceed = true;
            break;
          }
        }
        if (proceed) {
          const _name = name.split(' ');
          for (i = 0; i < _name.length; i++) {
            const check = dictionary.spellCheck(_name[i]);
            if (!check) {
              let suggs = dictionary.getSuggestions(_name[i]);
              _name[i] = suggs[0];
            }
            if (check[0]) {
              
            }
          }
          name = _name.join(' ');
          const videoResult = await playdl.search(name);
            if (videoResult[0]) {
              let _possibleVids = [];
              let vid = videoResult[0].title.toLowerCase();
              vid = vid.replace(regex, '');
              const Name = name.split(' ');
              let proceed = false;
              for (let i = 0; i < Name.length; i++) {
                const re = new RegExp(Name[i], 'g');
                const includes = re.test(vid);
                if (!includes) {
                  proceed = true;
                  break;
                }
              }
              if (!proceed) {
                return videoResult[0];
              } else {
              for (i = 0; i < 10; i++) {
                let vid = videoResult[i].title.toLowerCase();
                let includes = vid.includes(name);
                if (includes === true) {
                  return videoResult[i];
                }
              }
              for (i = 0; i < 6; i++) {
                let possibleVid = videoResult[i].title.toLowerCase();
                let dif = distance(name, possibleVid);
                _possibleVids.push({ dif: dif, video: videoResult[i] });
              }
              const returnObj = await topResult(_possibleVids); 
              return returnObj.video;
            }
          }
        }
        else {
          return videoResult[0]
        }
        return undefined;
      }
      return undefined;
    } catch (error) {
      console.log(`Videosearch error on ${query}`);
      let name = query.toLowerCase();
      const videoResult = await playdl.search(name);
      if (videoResult[0]) {
        return videoResult[0];
      }
    }
};
exports.videoFinder = videoFinder;
/**
 * @param  {string} videoName the string you wish to check
 * @returns {boolean} boolean value
 * @description uses RegExp to check the string for values inside of a valid url
 */
function validURL(videoName) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(videoName);
}
exports.validURL = validURL;
/**
 * @param  {Queue} serverQueue the current servers queue
 * @param  {any} queue the map that holds all of the serverQueues
 * @param  {any} DisconnectIdle the map that hold all of the Idles
 * @param  {Idle} serverDisconnectIdle the current servers Idle
 * @description searches for the song again to ensure it exists then plays that song at the play function
 * somewhat of a middleware function
 */
async function playNext(serverQueue, queue, DisconnectIdle, serverDisconnectIdle) {
    await (0, getVideo_1.default)(serverQueue);
    (0, play_1.default)(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
}
exports.playNext = playNext;
/**
 * @param  {Queue} serverQueue the current servers queue
 * @param  {_Song} currentsong a song object
 * @description finds the song specified in the params and removes it from the Queue
 */
function findSplice(serverQueue, currentsong) {
    const title = currentsong.title;
    for (let i = 0; i < serverQueue.songs.length; i++) {
        if (title === serverQueue.songs[i].title) {
            if (i === 0) {
                serverQueue.songs.shift();
            }
            else {
                console.log(`Splicing ${serverQueue.songs[i].title} ${i}`);
                serverQueue.songs.splice(i, 1);
            }
        }
    }
}
exports.findSplice = findSplice;
/**
 * @param  {Queue} serverQueue the current servers queue
 * @param  {any} queue the map that hold all of the serverQueues
 * @param  {any} DisconnectIdle the map that hold of the Idles
 * @param  {Idle} serverDisconnectIdle the current servers Idle
 * @description finds the song again to ensure it exists then sets a constant
 * to the song in front of the queue and pushes that song to the back, which makes a looped song queue
 */
async function loopNextSong(serverQueue, queue, DisconnectIdle, serverDisconnectIdle) {
    await (0, getVideo_1.default)(serverQueue);
    if (serverQueue.shuffle === true) {
        const currentsong = serverQueue.shuffledSongs[0];
        findSplice(serverQueue, currentsong);
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
exports.loopNextSong = loopNextSong;
