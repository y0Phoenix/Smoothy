const { getVoiceConnection } = require("@discordjs/voice");
const fs = require("fs");
const CircularJSON = require('circular-json');
const { findAncestor } = require("typescript");
const { url } = require("inspector");
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
        for (let j = 0;
            j < arr.length;
            j++) {
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
                    let dif = distance(query, arr[j].title);
                    options.push({dif: dif, video: arr[j]});
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
    const id = msg.guildId
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
                    if (!sdi.msgs[i].content) {
                        const channel = await sdi.client.channels.fetch(sdi.message.channelId);
                        const message = await channel.messages.fetch(sdi.msgs[i].id);
                        message.delete();
                    }
                    else {
                        sdi.msgs[i].delete();
                    }
                }
        }
        if (sdi.queueMsgs[0]) {
            for (let i = 0;
                i < sdi.queueMsgs.length;
                i++) {
                    if (!sdi.queueMsgs[i].content) {
                        const channel = await sdi.client.channels.fetch(sdi.message.channelId);
                        const message = await channel.messages.fetch(sdi.queueMsgs[i].id);
                        message.delete();
                    }
                    else {
                        sdi.queueMsgs[i].delete();
                    }
                }
        }
        if (vc) {
            vc.disconnect()
        }
        if (sq) {
            q.delete(id);
            await writeGlobal('delete queue', null, id);
        }
        if (sdi) {
            di.delete(id);
            await writeGlobal('delete dci', null, id);
        }

    }
}
/**
 * @param  {} id id of the discord server
 * @param  {} str which map you want to check
 * @variation str queue, dci
 */
async function exists(id, str) {
    const file = fs.readFileSync('./commands/config/global.json');
    const data = JSON.parse(file);
    if (str === 'queue') {
        for (let i = 0;
            i < data.queues.length;
            i++) {
                if (data.queues[i].id === id) {
                    return true;
                }
            }
    }
    if (str === 'dci') {
        for (let i = 0;
            i < data.disconnectIdles.length;
            i++) {
                if (data.disconnectIdles[i].id === id) {
                    return true
                }
            }
    }
    return false
}

/**
 * @param  {} str a string of what needs to happen
 * @variation str   
 * add dci,
 * add queue,
 * update queue,
 * update dci,
 * delete queue,
 * delete dci   
 * @param  {} data the data you need to write to the file
 * @param {} id the id of the discord server
 */
async function writeGlobal(str, data, id) {
    // todo implement nowPlaying msg saved to global.json
    const file = './commands/config/global.json';
    let _file = fs.readFileSync(file);
    let _data = JSON.parse(_file);
    let Data = {..._data}
    var d;
    var q;
    const dciGet = async () => {
        for (let i = 0;
            i < Data.disconnectIdles.length;
            i++) {
                if (Data.disconnectIdles[i].id === id) {
                    const j = Data.disconnectIdles.map(entry => entry.id).indexOf(id);
                    return j;
                }
            }
    }
    const queueGet = async () => {
        for (let i = 0;
            i < Data.queues.length;
            i++) {
                if (Data.queues[i].id === id) {
                    const j = Data.queues.map(entry => entry.id).indexOf(id);
                    return j;
                }
            }
    }
    if (id !== null) {    
        d = await dciGet();
        q = await queueGet()
    }
    if (str === 'add dci') {
        const dciObj = {
            message: data.message,
            id: data.message.guildId,
            disconnectTimer: undefined,
            voiceConnection: null,
            msgs: [],
            queueMsgs: [],
        }
        data.msgs.forEach(msg => {
            const authid = !msg.authorId ? msg.author.id : msg.authorId;
            dciObj.msgs.push({id: msg.id, guildId: msg.guildId, authorId: authid, channelId: msg.channelId});
        });
        data.queueMsgs.forEach(msg => {
            const authid = !msg.authorId ? msg.author.id : msg.authorId;
            dciObj.queueMsgs.push({id: msg.id, guildId: msg.guildId, authorId: authid, channelId: msg.channelId});
        });
        Data.disconnectIdles.push(dciObj);
    }
    if (str === 'add queue') {
        const queueObj = {
            message: data.message,
            id: data.message.guildId,
            voiceChannel: data.message.member.voice.channel,
            voiceConnection: null,
            songs: [],
            shuffledSongs: [],
            currentsong: [],
            jump: 0,
            tries: 0,
            audioPlayerErr: data.audioPlayerErr,
            player: null,
            subscription: null,
            previous: [],
            previousbool: data.previousbool,
            resource: null,
            messagesent: data.messagesent,
            nowPlaying: undefined,
            nowPlayingTimer: undefined,
            shuffle: data.shuffle,
            loop: data.loop,
            loopsong: data.loopsong,
            repeat: data.repeat,
            playlist: data.playlist,
            bool: data.bool,
        }
        data.songs.forEach(song => {
            const authid = !song.message.authorId ? song.message.author.id : song.message.authorId;
            queueObj.songs.push({title: song.title, url: song.url, message: {id: song.message.id, guildId: song.message.guildId, authorId: authid, channelId: song.message.channelId},
            duration: song.duration, durationS: song.durationS, thumbnail: song.thumbnail});
        });
        data.shuffledSongs.forEach(song => {
            const authid = !song.message.authorId ? song.message.author.id : song.message.authorId;
            queueObj.shuffledSongs.push({title: song.title, url: song.url, message: {id: song.message.id, guildId: song.message.guildId, authorId: authid, channelId: song.message.channelId},
            duration: song.duration, durationS: song.durationS, thumbnail: song.thumbnail});
        });
        const song = data.currentsong[0];
        const authid = !song.message.authorId ? song.message.author.id : song.message.authorId;
        queueObj.currentsong.push({title: song.title, url: song.url, message: {id: song.message.id, guildId: song.message.guildId, authorId: authid, channelId: song.message.channelId},
            duration: song.duration, durationS: song.durationS, thumbnail: song.thumbnail});
        Data.queues.push(queueObj);
    }
    if (str === 'update queue') {
        const queueObj = {
            message: data.message,
            id: data.message.guildId,
            voiceChannel: data.message.member.voice.channel,
            voiceConnection: null,
            songs: [],
            shuffledSongs: [],
            currentsong: [],
            jump: 0,
            tries: 0,
            audioPlayerErr: data.audioPlayerErr,
            player: null,
            subscription: null,
            previous: [],
            previousbool: data.previousbool,
            resource: null,
            messagesent: data.messagesent,
            nowPlaying: undefined,
            nowPlayingTimer: undefined,
            shuffle: data.shuffle,
            loop: data.loop,
            loopsong: data.loopsong,
            repeat: data.repeat,
            playlist: data.playlist,
            bool: data.bool,
        }
        data.songs.forEach(song => {
            const authid = !song.message.authorId ? song.message.author.id : song.message.authorId;
            queueObj.songs.push({title: song.title, url: song.url, message: {guildId: song.message.guildId, authorId: authid, channelId: song.message.channelId},
            duration: song.duration, durationS: song.durationS, thumbnail: song.thumbnail});
        });
        data.shuffledSongs.forEach(song => {
            const authid = !song.message.authorId ? song.message.author.id : song.message.authorId;
            queueObj.shuffledSongs.push({title: song.title, url: song.url, message: {guildId: song.message.guildId, authorId: authid, channelId: song.message.channelId},
            duration: song.duration, durationS: song.durationS, thumbnail: song.thumbnail});
        });
        const song = data.currentsong[0];
        const authid = !song.message.authorId ? song.message.author.id : song.message.authorId;
        queueObj.currentsong.push({title: song.title, url: song.url, message: {guildId: song.message.guildId, authorId: authid, channelId: song.message.channelId},
            duration: song.duration, durationS: song.durationS, thumbnail: song.thumbnail});
        Data.queues[q] = {...queueObj};
    }
    if (str === 'update dci') {
        const dciObj = {
            message: data.message,
            id: data.message.guildId,
            disconnectTimer: undefined,
            voiceConnection: null,
            msgs: [],
            queueMsgs: [],
        }
        data.msgs.forEach(msg => {
            const authid = !msg.authorId ? msg.author.id : msg.authorId;
            dciObj.msgs.push({id: msg.id, guildId: msg.guildId, authorId: authid, channelId: msg.channelId});
        });
        data.queueMsgs.forEach(msg => {
            const authid = !msg.authorId ? msg.author.id : msg.authorId;
            dciObj.queueMsgs.push({id: msg.id, guildId: msg.guildId, authorId: authid, channelId: msg.channelId});
        });
        Data.disconnectIdles[d] = {...dciObj};
    }
    if (str === 'delete queue') {
        Data.queues.splice(q, 1);
    }
    if (str === 'delete dci') {
        Data.disconnectIdles.splice(d, 1);
    }
    Data = CircularJSON.stringify(Data);
    fs.writeFileSync(file, Data);
}

module.exports =  { deleteMsg, leave, distance, topResult, find, writeGlobal, exists };