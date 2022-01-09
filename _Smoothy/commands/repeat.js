"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const modules_1 = require("../modules/modules");
//stops the audioPlayer and sets serverQueue.repeat to true, which is used inside of executive.js
module.exports = {
    name: 'repeat',
    description: 'repeats the current song',
    /**
     * @param  {Message} message the users Message
     * @param  {Queue} serverQueue the current servesQueue
     * @param  {Client} client the Smoothy Client
     * @description sets the repeat bool to true inside the serverQueue and stops the audioplayer inside the serverQueue which sets off {@link audioPlayerIdle}
     * which is an event listener on the audioplayer inside the serverQueue
     */
    repeat(message, serverQueue, client) {
        if (serverQueue) {
            if (serverQueue.player.state.status !== voice_1.AudioPlayerStatus.Paused) {
                if (serverQueue.songs.length > 0) {
                    serverQueue.player.stop();
                    serverQueue.repeat = true;
                    const restartCurrentEmbed = new discord_js_1.MessageEmbed()
                        .setColor('GREEN')
                        .setDescription(`:thumbsup: I Am Restarting ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})*** :arrows_counterclockwise:`);
                    message.channel.send({ embeds: [restartCurrentEmbed] })
                        .then(msg => (0, modules_1.deleteMsg)(msg, 60000, client));
                }
                else {
                    const notPlayingEmbed = new discord_js_1.MessageEmbed()
                        .setColor('GREEN')
                        .setDescription(`:rofl: Not Currently Playing Anything At The Moment`);
                    message.channel.send({ embeds: [notPlayingEmbed] })
                        .then(msg => (0, modules_1.deleteMsg)(msg, 30000, client));
                }
            }
            else {
                const pausedEmbed = new discord_js_1.MessageEmbed()
                    .setColor('RED')
                    .setDescription(':rofl: Please Unpause The Player Before Restarting');
                message.channel.send({ embeds: [pausedEmbed] })
                    .then(msg => (0, modules_1.deleteMsg)(msg, 30000, client));
            }
        }
        else {
            const notPlayingEmbed = new discord_js_1.MessageEmbed()
                .setColor('GREEN')
                .setDescription(`:rofl: Not Currently Playing Anything At The Moment`);
            message.channel.send({ embeds: [notPlayingEmbed] })
                .then(msg => (0, modules_1.deleteMsg)(msg, 30000, client));
        }
    }
};
