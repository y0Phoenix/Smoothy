"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//resumes the audioPlayer only if the audioPlayer is Paused
const discord_js_1 = require("discord.js");
const voice_1 = require("@discordjs/voice");
const modules_1 = require("../modules/modules");
/**
 * @param  {Message} message the users Message
 * @param  {Queue} serverQueue the current servers Queue
 * @param  {Client} client the Smoothy Client
 * @description unpauses the audioplayer inside the serverQueue
 */
async function resume(message, serverQueue, client) {
    if (serverQueue) {
        if (serverQueue.player.state.status === voice_1.AudioPlayerStatus.Paused) {
            serverQueue.player.unpause();
            const resumEmbed = new discord_js_1.MessageEmbed()
                .setColor('GREEN')
                .setDescription(`I Have Resumed ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})***`)
                .addFields({
                name: `Requested By`, value: `<@${message.author.id}>`, inline: true,
            }, {
                name: `***Duration***`, value: `${serverQueue.currentsong[0].duration}`, inline: true
            });
            message.channel.send({ embeds: [resumEmbed] })
                .then(msg => (0, modules_1.deleteMsg)(msg, 60000, client));
        }
        else {
            message.channel.send(`:rofl: Not Currently Paused :rofl:`)
                .then(msg => (0, modules_1.deleteMsg)(msg, 30000, client));
        }
    }
    else {
        message.channel.send(`:rofl: Not Currently Paused :rofl:`)
            .then(msg => (0, modules_1.deleteMsg)(msg, 30000, client));
    }
}
exports.default = resume;
