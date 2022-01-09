"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//pauses the song at the front of the serverQueue
const discord_js_1 = require("discord.js");
const modules_1 = require("../modules/modules");
module.exports = {
    name: 'pause',
    description: 'pauses the current song',
    /**
     * @param  {Message} message the users message
     * @param  {Queue} serverQueue the current servers Queue
     * @param  {Client} client the Smoothy Client
     * @description pauses the audioplayer inside the serverQueue
     */
    pause(message, serverQueue, client) {
        if (serverQueue !== undefined) {
            serverQueue.player.pause();
            const pauseEmbed = new discord_js_1.MessageEmbed()
                .setColor('RED')
                .setDescription(`I Have Paused ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})***`)
                .addField(`Help`, `You Can Resume By Typing ***-resume***`)
                .addFields({
                name: `Requested By`, value: `<@${message.author.id}>`, inline: true,
            }, {
                name: `***Duration***`, value: `${serverQueue.currentsong[0].duration}`, inline: true
            });
            message.channel.send({ embeds: [pauseEmbed] })
                .then(msg => (0, modules_1.deleteMsg)(msg, 60000, client));
        }
        else {
            message.channel.send(`:rofl: Nothing To Pause :rofl:`)
                .then(msg => (0, modules_1.deleteMsg)(msg, 30000, client));
        }
    }
};
