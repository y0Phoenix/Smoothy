"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const play_dl_1 = require("play-dl");
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const modules_1 = require("../../modules/modules");
const audioPlayerIdle_1 = require("./audioPlayerIdle");
/**
 @description where the song gets played and the nowPlaying message gets set and sent
 */
async function play() {
    const serverQueue = this;
    const yturl = play_dl_1.default.validate(serverQueue.currentsong[0].url) ? true : false;
    if (yturl === true) {
        try {
            const stream = await play_dl_1.default.stream(serverQueue.currentsong[0].url);
            serverQueue.resource = (0, voice_1.createAudioResource)(stream.stream, {
                inputType: stream.type,
                inlineVolume: true,
            });
            serverQueue.resource.metadata = serverQueue;
            serverQueue.player.play(serverQueue.resource);
            console.log('Playing ' + serverQueue.currentsong[0].title + '!');
            if (serverQueue.audioPlayerErr === false) {
                serverQueue.nowPlaying = await serverQueue.nowPlayingSend();
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
        serverQueue.message.channel.send({ embeds: [noVidEmbed] });
        serverQueue.player.stop();
        (0, audioPlayerIdle_1.default)();
    }
}
exports.default = play;
