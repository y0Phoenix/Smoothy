"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
async function nowPlayingSend() {
    const serverQueue = this;
    if (serverQueue.currentsong[0]) {
        const msg = serverQueue.message.channel.send({ embeds: [new discord_js_1.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(`:thumbsup: Now Playing`)
                    .setDescription(`:musical_note: ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})***`)
                    .addFields({
                    name: `Requested By`,
                    value: `<@${serverQueue.currentsong[0].message.author.id}>`,
                    inline: true,
                }, {
                    name: `***Duration***`,
                    value: `${serverQueue.currentsong[0].duration}`,
                    inline: true,
                })
                    .setThumbnail(`${serverQueue.currentsong[0].thumbnail}`)
            ] });
        return msg;
    }
}
exports.default = nowPlayingSend;
