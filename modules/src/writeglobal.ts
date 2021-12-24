import CircularJSON  from 'circular-json';
import fs from 'fs';


export async function writeGlobal(str: String, data: Object, id: String) {
    // todo implement nowPlaying msg saved to global.json
    const file = './config/global.json';
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
        return null
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
        return null
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
        if (q == null) {
            return
        }
        Data.queues.splice(q, 1);
    }
    if (str === 'delete dci') {
        if (d == null) {
            return
        }
        Data.disconnectIdles.splice(d, 1);
    }
    Data = CircularJSON.stringify(Data);
    fs.writeFileSync(file, Data);
}