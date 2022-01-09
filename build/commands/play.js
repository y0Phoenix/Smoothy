"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//checks if a link was specified, if the user is inside of a voiceChannel, if Smoothy has permission to connect and if Smoothy has permission to speak
//then joins the voiceChannel and finds the video. Both functions are inside of executive.js 
const discord_js_1 = require("discord.js");
const executive_1 = require("../executive");
const modules_1 = require("../modules/modules");
const needVCEmbed = new discord_js_1.MessageEmbed()
    .setColor('RED')
    .setDescription(':nerd: You Need To Be In A ***Voice Channel*** To Execute This Command');
const specifyEmbed = new discord_js_1.MessageEmbed()
    .setColor('RED')
    .setDescription(':nerd: You Need To Specify With Either A ***Link*** Or ***Search*** ***Query***');
const connectEmbed = new discord_js_1.MessageEmbed()
    .setColor('RED')
    .setDescription(':nerd: I Dont Have The ***Permission To Connect***');
const speakEmbed = new discord_js_1.MessageEmbed()
    .setColor('RED')
    .setDescription(':nerd: I Dont Have The ***Permissins To Speak*** ');
module.exports = {
    name: 'play',
    /**
     * @param  {Message} message the users message
     * @param  {any} args the users message content without the command and prefix
     * @param  {Message['member']['voice']['channel']} vc the users voice channel
     * @param  {any} queue the map that hold all of the Queue
     * @param  {any} DisconnectIdle the map that hold all of the Idles
     * @param  {Idle} serverDisconnectIdle the current servers Idle
     * @param  {Queue} serverQueue the current servers Queue
     * @param  {string} command the command from the user
     * @param  {Client} client the Smoothy client
     * @description check conditions inorder for Smoothy to play a song then joins the vc and plays whatever song or playlist the user entered
     */
    description: 'plays the specified song',
    async play(message, args, vc, queue, DisconnectIdle, serverDisconnectIdle, serverQueue, command, client) {
        try {
            if (args.length === 0)
                return message.channel.send({ embeds: [specifyEmbed] })
                    .then(msg => (0, modules_1.deleteMsg)(msg, 30000, serverDisconnectIdle.client));
            if (!vc)
                return message.channel.send({ embeds: [needVCEmbed] })
                    .then(msg => (0, modules_1.deleteMsg)(msg, 30000, serverDisconnectIdle.client));
            const permissions = vc.permissionsFor(message.client.user);
            if (!permissions.has('CONNECT'))
                return message.channel.send({ embeds: [connectEmbed] })
                    .then(msg => (0, modules_1.deleteMsg)(msg, 30000, serverDisconnectIdle.client));
            if (!permissions.has('SPEAK'))
                return message.channel.send({ embeds: [speakEmbed] })
                    .then(msg => (0, modules_1.deleteMsg)(msg, 30000, serverDisconnectIdle.client));
            const bool = await (0, modules_1.exists)(message.guildId, 'dci');
            if (command !== null && command === 'pp' || command === 'playp') {
                await (0, executive_1.joinvoicechannel)(message, vc, DisconnectIdle, serverDisconnectIdle, client, bool);
                const sdi = DisconnectIdle.get(message.guild.id);
                (0, executive_1.findvideoplaylist)(message, args, queue, DisconnectIdle, sdi, serverQueue);
            }
            else {
                await (0, executive_1.joinvoicechannel)(message, vc, DisconnectIdle, serverDisconnectIdle, client, bool);
                const sdi = DisconnectIdle.get(message.guild.id);
                (0, executive_1.FindVideoCheck)(message, args, queue, DisconnectIdle, sdi, serverQueue);
            }
        }
        catch (error) {
            console.error(error);
        }
    }
};
