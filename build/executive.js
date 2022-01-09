"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinvoicechannel = exports.findvideoplaylist = exports.FindVideoCheck = void 0;
//executive file holds all the executive functions and is the largest file
const ytpl = require("ytpl");
const modules_1 = require("./modules/modules");
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const Idle_1 = require("./Classes/Idle");
const Song_1 = require("./Classes/Song");
const Queue_1 = require("./Classes/Queue");
const validURL_1 = require("./functions/validURL");
const videoFinder_1 = require("./functions/videoFinder");
const ytdl = require("ytdl-core");
const noVidEmbed = new discord_js_1.MessageEmbed()
    .setColor('RED')
    .setDescription(':rofl: No ***video*** results found');
/**
 * @param  {} message the users message
 * @param  {} queue the map that hols all of the Queue
 * @param  {} DisconnectIdle the map that holds all of the Idles
 * @param  {} serverDisconnectIdle the current servers Idle
 * @param  {} serverQueue the current servers Queue
 * @param  {} videoURL the ytdl video
 * @description checks if a serverQueue exists if it doesn't it creates one and pushes it to the queue map then it continues onto {@link play}, else it pushes a new Song to the serverQueue.songs array
 */
async function executive(message, queue, DisconnectIdle, serverDisconnectIdle, serverQueue, videoURL) {
    serverDisconnectIdle = DisconnectIdle.get(message.guild.id);
    const client = DisconnectIdle.get(1);
    if (!serverDisconnectIdle) {
        DisconnectIdle.set(message.guild.id, new Idle_1.Idle({ message: message, client: client }));
        serverDisconnectIdle = DisconnectIdle.get(message.guild.id);
    }
    else {
        if (serverDisconnectIdle.disconnectTimer !== undefined) {
            clearTimeout(serverDisconnectIdle.disconnectTimer);
            console.log('Cleared Timout For disconnectTimer');
        }
    }
    //checks if a serverQueue exists if it doesn't it creates the queue, else the song is pushed into serverQueue.songs
    if (!serverQueue) {
        const _queue = new Queue_1.default({ msg: message });
        queue.set(message.guild.id, _queue);
        serverQueue = queue.get(message.guild.id);
        const songObj = new Song_1.Song({ message: message, data: videoURL });
        serverQueue.songs.push(songObj);
        serverQueue.currentsong.push(songObj);
        (0, modules_1.writeGlobal)('add queue', serverQueue, serverQueue.id);
        serverQueue.play();
    }
    else {
        let songObj = new Song_1.Song({ message: message, data: videoURL });
        serverQueue.songs.push(songObj);
        (0, modules_1.writeGlobal)('update queue', serverQueue, serverQueue.id);
        const addQueueEmbed = new discord_js_1.MessageEmbed()
            .setColor('YELLOW')
            .setDescription(`***[${videoURL.videoDetails.title}](${videoURL.videoDetails.video_url})***
        Has Been Added To The Queue :arrow_down:`);
        let msg = await message.channel.send({ embeds: [addQueueEmbed] });
        serverDisconnectIdle.msgs.push(msg);
        (0, modules_1.writeGlobal)('update dci', serverDisconnectIdle, serverDisconnectIdle.id);
    }
}
/**
 * @param  {Message} message the users Message
 * @param  {any} args the users Message content without the command or prefix
 * @param  {any} queue the map that holds all of the server Queues
 * @param  {any} DisconnectIdle the map the holds all of the server Idles
 * @param  {Idle} serverDisconnectIdle the current servers Idle
 * @param  {Queue} serverQueue the current servers Queue
 * @description find the video via ytdl-core and args and continues onto {@link executive}
 */
async function FindVideoCheck(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue) {
    let videoName;
    if (Array.isArray(args)) {
        videoName = args.join(' ');
    }
    else {
        videoName = args;
    }
    let URL = (0, validURL_1.default)(videoName);
    if (URL === true) {
        const videoURL = await ytdl.getBasicInfo(videoName);
        if (videoURL) {
            console.log(`Found ${videoURL.videoDetails.title}`);
            executive(message, queue, DisconnectIdle, serverDisconnectIdle, serverQueue, videoURL);
        }
        else {
            message.channel
                .send({ embeds: [noVidEmbed] })
                .then((msg) => (0, modules_1.deleteMsg)(msg, 30000, serverDisconnectIdle.client));
            return;
        }
    }
    else {
        const video = await (0, videoFinder_1.default)(videoName);
        if (video) {
            const videoURL = await ytdl.getBasicInfo(video.url);
            console.log(`Found ${videoURL.videoDetails.title}`);
            executive(message, queue, DisconnectIdle, serverDisconnectIdle, serverQueue, videoURL);
        }
        else {
            message.channel
                .send({ embeds: [noVidEmbed] })
                .then((msg) => (0, modules_1.deleteMsg)(msg, 30000, serverDisconnectIdle.client));
            return;
        }
    }
}
exports.FindVideoCheck = FindVideoCheck;
/**
 * @param  {Message} message the users Message
 * @param  {any} args the users Message content without the command and prefix
 * @param  {any} queue the map that holds all of the Queues
 * @param  {any} DisconnectIdle the map that holds all of the Idles
 * @param  {Idle} serverDisconnectIdle the current servers Idles
 * @param  {Queue} serverQueue the current servers Queue
 * @description finds the YouTube playlist via ytpl via args, goes to {@link executive} if a serverQueue doesn't exists, then pushes the data into the serverQueue.songs array
 */
async function findvideoplaylist(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue) {
    serverDisconnectIdle = DisconnectIdle.get(message.guild.id);
    if (serverDisconnectIdle.disconnectTimer !== undefined) {
        clearTimeout(serverDisconnectIdle.disconnectTimer);
        console.log('Cleared Timout For disconnectTimer');
    }
    const videoName = args.join(' ');
    if (videoName.includes('/playlist')) {
        const playlist = await ytpl(videoName);
        var added = false;
        if (playlist) {
            const videoURL = await ytdl.getBasicInfo(playlist.items[0].shortUrl);
            const playlistEmbed = new discord_js_1.MessageEmbed()
                .setColor('GOLD')
                .setTitle(`Found YouTube Playlist`)
                .setDescription(`:notes: ***[${playlist.title}](${playlist.url})***
                  All The Songs Will Be Added To The Queue!`)
                .addFields({
                name: 'Requested By',
                value: `<@${message.author.id}>`,
                inline: true,
            }, {
                name: 'Song Count',
                value: `**${playlist.estimatedItemCount}**`,
            })
                .setThumbnail(`${playlist.bestThumbnail.url}`)
                .setTimestamp();
            console.log(`Found YouTube playlist ${playlist.title}`);
            if (!serverQueue) {
                queue.set(message.guild.id, new Queue_1.default({ msg: message }));
                serverQueue = queue.get(message.guild.id);
                serverQueue.songs.push(new Song_1.Song({ message: message, data: videoURL }));
                serverQueue.currentsong.push(new Song_1.Song({ message: message, data: videoURL }));
                serverQueue.messagesent = true;
                console.log('Created the serverQueue');
                added = true;
                (0, modules_1.writeGlobal)('add queue', serverQueue, serverQueue.id);
                serverQueue.play();
            }
            let msg = await message.channel.send({ embeds: [playlistEmbed], });
            serverDisconnectIdle.msgs.push(msg);
            (0, modules_1.writeGlobal)('update dci', serverDisconnectIdle, serverDisconnectIdle.id);
            for (let i = 0; i < playlist.items.length; i++) {
                if (added === true) {
                    added = false;
                }
                else {
                    const songObj = new Song_1.PlaylistSong({ message: message, playlist: playlist.items[i] });
                    serverQueue.songs.push(songObj);
                }
            }
            (0, modules_1.writeGlobal)('update queue', serverQueue, serverQueue.id);
        }
        else {
            const noPlaylistEmbed = new discord_js_1.MessageEmbed()
                .setColor('RED')
                .setDescription(':rofl: Playlist Either Doesnt Exist Or Is Private');
            message.channel
                .send({ embeds: [noPlaylistEmbed] })
                .then((msg) => (0, modules_1.deleteMsg)(msg, 30000, serverDisconnectIdle.client));
        }
    }
    else {
        const wrongEmbed = new discord_js_1.MessageEmbed()
            .setColor('RED')
            .setDescription(':rofl: You Need To Add A Valid Playlist Link');
        message.channel
            .send({ embeds: [wrongEmbed] })
            .then((msg) => (0, modules_1.deleteMsg)(msg, 30000, serverDisconnectIdle.client));
    }
}
exports.findvideoplaylist = findvideoplaylist;
async function joinvoicechannel(message, vc, DisconnectIdle, serverDisconnectIdle, client, bool) {
    if (voice_1.VoiceConnectionStatus.Disconnected) {
        const VoiceConnection = (0, voice_1.joinVoiceChannel)({
            channelId: vc.id,
            guildId: vc.guild.id,
            adapterCreator: vc.guild.voiceAdapterCreator,
        });
        //sets the DisconnectIdle map
        if (!serverDisconnectIdle) {
            if (bool) {
                DisconnectIdle.set(message.guild.id, bool);
            }
            else {
                DisconnectIdle.set(message.guild.id, new Idle_1.Idle({ message: message, client: client }));
                await (0, modules_1.writeGlobal)('add dci', DisconnectIdle.get(message.guild.id), message.guild.id);
            }
        }
        return VoiceConnection;
    }
}
exports.joinvoicechannel = joinvoicechannel;
