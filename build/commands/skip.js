"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//stops the audioPlayer which make AudioPlayerStatus Idle, which then exeuctes the function at ../executive.js(78)
const discord_js_1 = require("discord.js");
const modules_1 = require("../modules/modules");
/**
 * @param  {Message} message the users Messgae
 * @param  {Queue} serverQueue the current servers Queue
 * @param  {Client} client the Smoothy Client
 * @description stops the audioplayer inside the serverQueue which sets of {@link audioPlayerIdle} via an audioplayer event listener inside the serverQueue
 */
async function skip(message, serverQueue, client) {
    if (serverQueue !== undefined) {
        if (serverQueue.songs.length > 0) {
            try {
                console.log("Skipping " + serverQueue.currentsong[0].title + "!");
                const skipEmbed = new discord_js_1.MessageEmbed()
                    .setColor('AQUA')
                    .setTitle(`:next_track: Skipping`)
                    .setDescription(` ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})***`)
                    .addFields({
                    name: `Requested By`, value: `<@${message.author.id}>`, inline: true,
                }, {
                    name: `***Duration***`, value: `${serverQueue.currentsong[0].duration}`, inline: true
                });
                message.channel.send({ embeds: [skipEmbed] })
                    .then(msg => (0, modules_1.deleteMsg)(msg, 60000, client));
                serverQueue.player.stop();
            }
            catch (error) {
                console.log('Unknown MSG');
            }
        }
        else {
            message.channel.send(':rofl: Nothing To ***Skip*** :rofl:')
                .then(msg => (0, modules_1.deleteMsg)(msg, 30000, client));
        }
    }
}
exports.default = skip;
