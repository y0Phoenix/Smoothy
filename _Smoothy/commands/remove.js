"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//removes a specified song inside of serverQueue using a number inside of args
const discord_js_1 = require("discord.js");
const modules_1 = require("../modules/modules");
module.exports = {
    name: 'remove',
    description: 'removes specified song from the serverQueue',
    /**
     * @param  {Message} message the users Message
     * @param  {any} args the users message content without the command and prefix
     * @param  {Queue} serverQueue the current serversQueue
     * @param  {Client} client the Smoothy Client
     * @description removes a song from the serverQueue via searchquery or index
     */
    async remove(message, args, serverQueue, client) {
        var i = parseInt(args);
        var query = args.join(' ');
        if (isNaN(i)) {
            const result = await (0, modules_1.find)(serverQueue, query);
            if (result !== null) {
                if (result.shuffledSong) {
                    i = result.shuffledSong;
                    serverQueue.songs.splice(result.song, 1);
                }
                else {
                    i = result.song;
                }
            }
        }
        if (serverQueue.shuffle === true) {
            const result = await (0, modules_1.find)(serverQueue, serverQueue.shuffledSongs[i].title);
            serverQueue.songs.splice(result.song, 1);
            if (serverQueue.shuffledSongs[i]) {
                const removeEmbed = new discord_js_1.MessageEmbed()
                    .setColor('BLURPLE')
                    .setDescription(`I Have Removed ***[${serverQueue.shuffledSongs[i].title}](${serverQueue.shuffledSongs[i].url})***`)
                    .addFields({
                    name: `Requested By`, value: `<@${message.author.id}>`, inline: true,
                }, {
                    name: `***Duration***`, value: `${serverQueue.shuffledSongs[i].duration}`, inline: true
                });
                message.channel.send({ embeds: [removeEmbed] })
                    .then(msg => (0, modules_1.deleteMsg)(msg, 60000, client));
                serverQueue.shuffledSongs.splice(i, 1);
                (0, modules_1.writeGlobal)('update queue', serverQueue, serverQueue.id);
            }
            else {
                message.channel.send('No Song Specified')
                    .then(msg => (0, modules_1.deleteMsg)(msg, 30000, client));
            }
        }
        else {
            if (serverQueue.songs[i]) {
                const removeEmbed = new discord_js_1.MessageEmbed()
                    .setColor('BLURPLE')
                    .setTitle(':eject: Removing Song')
                    .setURL(`${serverQueue.songs[i].url}`)
                    .setDescription(`I Have Removed ***[${serverQueue.songs[i].title}](${serverQueue.songs[i].url})***`)
                    .addFields({
                    name: `Requested By`, value: `<@${message.author.id}>`, inline: true,
                }, {
                    name: `***Duration***`, value: `${serverQueue.songs[i].duration}`, inline: true
                })
                    .setThumbnail(`${serverQueue.songs[i].thumbnail}`)
                    .setTimestamp();
                message.channel.send({ embeds: [removeEmbed] })
                    .then(msg => (0, modules_1.deleteMsg)(msg, 60000, client));
                serverQueue.songs.splice(i, 1);
                (0, modules_1.writeGlobal)('update queue', serverQueue, serverQueue.id);
            }
            else {
                message.channel.send('No Song Specified')
                    .then(msg => (0, modules_1.deleteMsg)(msg, 30000, client));
            }
        }
    }
};
