const { AudioPlayerStatus } = require("@discordjs/voice");
const { MessageEmbed } = require("discord.js");
const { deleteMsg } = require("../modules");

const noSongs = new MessageEmbed()
    .setColor('RED')
    .setDescription(':rofl: Cant Play A Previous Song')
;

module.exports = {
    name: 'previous',
    description: 'play the last song',
    async previous(message, args, serverQueue, serverDisconnectIdle) {
        if (serverQueue) {
            if (serverQueue.previous.length > 0) {
                if (serverQueue.player.state.status === AudioPlayerStatus.Playing) {
                    serverQueue.previousbool = true;
                    const previousEmbed = new MessageEmbed()
                        .setColor('GREEN')
                        .setDescription(`:thumbsup: Going Back To [${serverQueue.previous[0].title}](${serverQueue.previous[0].url})`)
                    ;
                    let msg = await message.channel.send({embeds: [previousEmbed]});
                    deleteMsg(msg, 60000, false);
                    serverQueue.player.stop();
                }
                else {
                    const pausedEmbed = new MessageEmbed()
                        .setColor('RED')
                        .setDescription(':rofl: Cant Play The Previos Song While Paused')
                    ;
                    let msg = await message.channel.send({embeds: [pausedEmbed]});
                    deleteMsg(msg, 30000, false);
                }
            }
            else {
                let msg = await message.channel.send({embeds: [noSongs]});
                deleteMsg(msg, 30000, false);
            }
        }
        else {
            let msg = await message.channel.send({embeds: [noSongs]});
            deleteMsg(msg, 30000, false);
        }
    }
}