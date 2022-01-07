"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const play_dl_1 = require("play-dl");
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const modules_1 = require("../../modules/modules");
const audioPlayerIdle_1 = require("./audioPlayerIdle");
const embed_1 = require("../../functions/embed");
/**
 * @param  {Queue} serverQueue the current servers queue
 * @param  {any} queue the map that holds all of the sever queues
 * @param  {any} DisconnectIdle the map that holds all of the server Idles
 * @param  {Idle} serverDisconnectIdle the current servers Idle
 */
async function play(serverQueue, queue, DisconnectIdle, serverDisconnectIdle) {
    let yturl;
    if (serverQueue.shuffle === true) {
        yturl = play_dl_1.default.validate(serverQueue.shuffledSongs[0].url) ? true : false;
    }
    else {
        yturl = play_dl_1.default.validate(serverQueue.currentsong[0].url) ? true : false;
    }
    if (yturl === true) {
        try {
            // todo fix ytdl-core v4.9.2 errors
            const stream = await play_dl_1.default.stream(serverQueue.currentsong[0].url);
            serverQueue.resource = (0, voice_1.createAudioResource)(stream.stream, {
                inputType: stream.type,
                inlineVolume: true,
            });
            serverQueue.resource.metadata = serverQueue;
            serverQueue.player.play(serverQueue.resource);
            console.log('Playing ' + serverQueue.currentsong[0].title + '!');
            if (serverQueue.audioPlayerErr === false) {
                const playembed = new discord_js_1.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(`:thumbsup: Now Playing`)
                    .setDescription(`:musical_note: ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})***`)
                    .addFields({
                    name: `Requested By`,
                    value: `<@${serverQueue.currentsong[0].message.author.id}>`,
                    inline: true,
                }, {
                    name: `***Duration***`,
                    value: `${serverQueue.currentsong[0].duration}`,
                    inline: true,
                })
                    .setThumbnail(`${serverQueue.currentsong[0].thumbnail}`);
                serverQueue.nowPlaying = await serverQueue.message.channel.send({ embeds: [playembed] });
                serverQueue.messagesent = true;
                (0, modules_1.writeGlobal)('update queue', serverQueue, serverQueue.id);
            }
            serverQueue.repeat = false;
        }
        catch (err) {
            console.log(err);
        }
    }
    else {
        const noVidEmbed = new discord_js_1.MessageEmbed()
            .setColor('RED')
            .setDescription(':rofl: No ***video*** results found');
        (0, embed_1.default)(serverQueue.message, noVidEmbed, 30000);
        serverQueue.player.stop();
        (0, audioPlayerIdle_1.default)(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
    }
}
exports.default = play;
