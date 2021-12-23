const { getVoiceConnection } = require("@discordjs/voice");
/**
 * @param  {} queue the object that is the serverQueue with the songs
 * @param  {} query the song you wish to find
 * @returns an object with two params song, shuffledSong shuffled song will return null if the serverQueue was not shuffled
 * @returns null if an error occurred
 */
async function find(queue, query) {
    const options = [];
    const returnObj = {};
    let proceed = true;
    let result;
    const shuffle = queue.shuffle ? true : false;
    let arr = queue.shuffle ? [...queue.shuffledSongs] : [...queue.songs];
    try {
        for (let j = 0;
            j < arr.length;
            j++) {
                const bool = arr[j].title.toLowerCase().includes(query);
                if (bool) { 
                    returnObj.song = queue.songs.map(video => video.title).indexOf(arr[j].title);
                    queue.songs.splice(i, 1);
                    if (shuffle) {
                        returnObj.shuffledSong = arr.map(video => video.title).indexOf(arr[j].title);
                    }
                    proceed = false;
                    break;
                }
                else {
                    let dif = distance(query, arr[j].title);
                    options.push({dif: dif, video: arr[j]});
                }
            }
        if (proceed) {
            result = topResult(options);
            returnObj.song = queue.songs.map(video => video.title).indexOf(result.video.title);
            if (shuffle) {
                returnObj.shuffledSong = queue.shuffledSongs.map(video => video.title).indexOf(result.video.title);
            }
        }
        return returnObj;
    } catch (err) {
        console.error(err);
        return null;
    }
}
/**
 * @param  {} name search query/string you are finding the distance to
 * @param  {} possibleVid the string you want to see the distance between
 * @returns number which is the distance betweent the two strings
 */
const distance = (name = '', possibleVid = '') => {
    const track = Array(possibleVid.length + 1)
      .fill(null)
      .map(() => Array(name.length + 1).fill(null));
    for (let i = 0; i <= name.length; i += 1) {
      track[0][i] = i;
    }
    for (let j = 0; j <= possibleVid.length; j += 1) {
      track[j][0] = j;
    }
    for (let j = 1; j <= possibleVid.length; j += 1) {
      for (let i = 1; i <= name.length; i += 1) {
        const indicator = name[i - 1] === possibleVid[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator
        );
      }
    }
    return track[possibleVid.length][name.length];
}
/**
 * @param  {} Array the array you want to sort to find the highest 
 * @requires number with the name dif inside each object entry inside the array 
 * @returns the object that has the lowest dif value
 */
const topResult = (Array) => {
    let v = 0;
    let j = 0;
    for (i = 0;
        i < Array.length;
        i++) {
            if (v === 0) {
                v = Array[i].dif;
                j = i;
            }  
            else {
                if (v > Array[i].dif) {
                    v = Array[i].dif;
                    j = i;
                }
        }
    }
    return Array[j];
}
/**
 * @param  {} message the message to delete 
 * @param  time number needed for the amount of time before a message delete defaults to 30 sec
 * @param  {} bool depricated
 */
async function deleteMsg(message, time, bool) {
    if (!time || isNaN(time)) {
        time = 30000;
    }
    if (!message || !isNaN(message)) {
        return;
    }
    else {
        setTimeout( async () => { await message.delete() }, time);
    }
}

/**
 * @param  {} queue the queue map for songs 
 * @param  {} DisconnectIdle the map for idle timer and message arrays
 * @param  {} message any message object from the discord server needed for GuidId
 */
async function leave(q, di, msg) {
    const id = msg.guild.id
    const vc = getVoiceConnection(id);
    const sdi = di.get(id);
    const sq = q.get(id);
    if (vc) {
        if (sq) {
            if (sq.nowPlaying) {
                sq.nowPlaying.delete();
            }
        }
        if (sdi.msgs[0]) {
            for (let i = 0;
                i < sdi.msgs.length;
                i++) {
                    sdi.msgs[i].delete();
                }
        }
        if (sdi.queueMsgs[0]) {
            for (let i = 0;
                i < sdi.queueMsgs.length;
                i++) {
                    sdi.queueMsgs[i].delete();
                }
        }
        if (vc) {
            vc.disconnect()
        }
        if (sq) {
            q.delete(id);
        }
        if (sdi) {
            di.delete(id);
        }
    }
}

module.exports =  { deleteMsg, leave, distance, topResult, find };