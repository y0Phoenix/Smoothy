"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const fs = require("fs");
const modules_1 = require("../modules/modules");
const File = './config/prefixes.json';
/**
 * @param  {Message} message the users message
 * @param  {any} args the users message without the command and prefix
 * @param  {any} data the data from the prefixes file
 * @param  {number} found the index of the currents servers prefix
 * @param  {Client} client the Smoothy client
 * @description changes the current servers prefix in the data param with the found index and writes the new data back to the file
 */
function changeprefix(message, args, data, found, client) {
    if (args.length > 0) {
        let prefix = args[0];
        if (found === 0) {
            data.push({ guildId: message.guildId, prefix: prefix });
            fs.writeFileSync(File, JSON.stringify(data));
        }
        else if (found > 0) {
            data[found].prefix = prefix;
            fs.writeFileSync(File, JSON.stringify(data));
        }
        const prefixEmbed = new discord_js_1.MessageEmbed()
            .setColor('RED')
            .addFields({
            name: ':thumbsup: New Prefix', value: `**${prefix}**`
        });
        message.channel.send({ embeds: [prefixEmbed] })
            .then(msg => (0, modules_1.deleteMsg)(msg, 60000, client));
    }
    else {
        const specifyEmbed = new discord_js_1.MessageEmbed()
            .setColor('RED')
            .setDescription(':thumbsdown: You Must Specify With A New Prefix');
        message.channel.send({ embeds: [specifyEmbed] })
            .then(msg => (0, modules_1.deleteMsg)(msg, 30000, client));
    }
}
exports.default = changeprefix;
