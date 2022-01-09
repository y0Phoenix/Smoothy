"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//sets serverQueue.loop to true if false, else sets it to false
const discord_js_1 = require("discord.js");
const modules_1 = require("../modules/modules");
module.exports = {
    name: 'loop',
    description: 'loops the current server queue',
    /**
     * @param  {Message} message the users message
     * @param  {Queue} serverQueue the current servers Queue
     * @param  {Idle} serverDisconnectIdle the current servers Idle
     * @description sets the loop boolean inside serverQueue to true
     */
    async loop(message, serverQueue, serverDisconnectIdle) {
        if (serverQueue) {
            if (serverQueue.loop === false) {
                serverQueue.loop = true;
                const loopEmbed = new discord_js_1.MessageEmbed()
                    .setColor('PURPLE')
                    .setDescription(`:thumbsup: I Am Now Looping The Current Queue! :repeat:`);
                let msg = await message.channel.send({ embeds: [loopEmbed] });
                serverDisconnectIdle.msgs.push(msg);
                (0, modules_1.writeGlobal)('update dci', serverDisconnectIdle, message.guildId);
                (0, modules_1.writeGlobal)('update queue', serverQueue, message.guildId);
            }
            else {
                serverQueue.loop = false;
                const endLoopEmbed = new discord_js_1.MessageEmbed()
                    .setColor('PURPLE')
                    .setDescription(`:x: No Longer Looping The Queue!`);
                message.channel.send({ embeds: [endLoopEmbed] })
                    .then(msg => (0, modules_1.deleteMsg)(msg, 60000, serverDisconnectIdle.client));
                (0, modules_1.writeGlobal)('update queue', serverQueue, message.guildId);
            }
        }
        else {
            message.channel.send(':rofl: No Queue To Loop :rofl:')
                .then(msg => (0, modules_1.deleteMsg)(msg, 30000, serverDisconnectIdle.client));
        }
    }
};
