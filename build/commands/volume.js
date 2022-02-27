"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const modules_1 = require("../modules/modules");
const maps_1 = require("../maps");
const noSongEmbed = new discord_js_1.MessageEmbed()
    .setColor('RED')
    .setDescription(':rofl: No Song To Change Volume');
function volumeE(v) {
    const volumeEmbed = new discord_js_1.MessageEmbed()
        .setColor('GOLD')
        .setDescription(`:thumbsup: Volume Is Now ${v}`)
        .setTimestamp();
    return volumeEmbed;
}
/**
 * @param  {Message} message the users Message
 * @param  {any} args the users Message content without the command or prefix
 * @param  {Queue} serverQueue the current server Queue
 * @param  {Idle} serverDisconnectIdle the current servers Idle
 * @description sets the volume number inside serverQueue.resources' audiioResource
 */
async function volume(message, args, serverQueue, serverDisconnectIdle) {
    let volume;
    const { DisconnectIdle } = (0, maps_1.default)();
    if (args.length > 0) {
        if (serverQueue) {
            args = args[0].toLowerCase();
            if (args === 'default' || args === 'reset' || args === 'de' || args === 're') {
                volume = 1;
                serverQueue.resource.volume.volume = volume;
                let embed = volumeE(volume);
                let msg = await message.channel.send({ embeds: [embed] });
                (0, modules_1.deleteMsg)(msg, 60000, DisconnectIdle.get(1));
                (0, modules_1.writeGlobal)('update dci', serverDisconnectIdle, serverQueue.id);
            }
            else {
                volume = parseInt(args);
                if (serverQueue.songs.length > 0) {
                    if (args <= 100) {
                        serverQueue.resource.volume.volume = volume;
                        let embed = volumeE(volume);
                        let msg = await message.channel.send({ embeds: [embed] });
                        (0, modules_1.deleteMsg)(msg, 60000, DisconnectIdle.get(1));
                        (0, modules_1.writeGlobal)('update dci', serverDisconnectIdle, serverDisconnectIdle.id);
                    }
                    else {
                        const toHighEmbed = new discord_js_1.MessageEmbed()
                            .setColor('RED')
                            .setDescription(':rofl: Volume is 100 max');
                        message.channel.send({ embeds: [toHighEmbed] })
                            .then(msg => (0, modules_1.deleteMsg)(msg, 30000, DisconnectIdle.get(1)));
                    }
                }
                else {
                    message.channel.send({ embeds: [noSongEmbed] })
                        .then(msg => (0, modules_1.deleteMsg)(msg, 30000, DisconnectIdle.get(1)));
                }
            }
        }
        else {
            message.channel.send({ embeds: [noSongEmbed] })
                .then(msg => (0, modules_1.deleteMsg)(msg, 30000, DisconnectIdle.get(1)));
        }
    }
    else {
        const specifyEmbed = new discord_js_1.MessageEmbed()
            .setColor('RED')
            .setDescription(':rofl: You Must Specify With A Number');
        message.channel.send({ embeds: [specifyEmbed] })
            .then(msg => (0, modules_1.deleteMsg)(msg, 30000, DisconnectIdle.get(1)));
    }
}
exports.default = volume;
