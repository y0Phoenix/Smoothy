import { AudioPlayerStatus } from "@discordjs/voice";
import { MessageEmbed, Message } from "discord.js";
import { Idle } from "../Classes/Idle";
import Queue from "../Classes/Queue";
import { deleteMsg } from "../modules/modules";

const noSongs = new MessageEmbed()
    .setColor('RED')
    .setDescription(':rofl: Cant Play A Previous Song')
;

module.exports = {
    name: 'previous',
    description: 'play the last song',
    /**
     * @param  {Message} message the users message
     * @param  {Queue} serverQueue the current servers Queue
     * @param  {Idle} serverDisconnectIdle the current servers Idle
     * @description sets the previousbool inside serverQueue to true and stops the audioplayer inside serverQueue which sets off the idle event listener on the audioplayer
     */
    async previous(message: Message, serverQueue: Queue, serverDisconnectIdle: Idle) {
        if (serverQueue) {
            if (serverQueue.previous.length > 0) {
                if (serverQueue.player.state.status === AudioPlayerStatus.Playing) {
                    serverQueue.previousbool = true;
                    const previousEmbed = new MessageEmbed()
                        .setColor('GREEN')
                        .setDescription(`:thumbsup: Going Back To [${serverQueue.previous[0].title}](${serverQueue.previous[0].url})`)
                    ;
                    let msg = await message.channel.send({embeds: [previousEmbed]});
                    deleteMsg(msg, 60000, serverDisconnectIdle.client);
                    serverQueue.player.stop();
                }
                else {
                    const pausedEmbed = new MessageEmbed()
                        .setColor('RED')
                        .setDescription(':rofl: Cant Play The Previos Song While Paused')
                    ;
                    let msg = await message.channel.send({embeds: [pausedEmbed]});
                    deleteMsg(msg, 30000, serverDisconnectIdle.client);
                }
            }
            else {
                let msg = await message.channel.send({embeds: [noSongs]});
                deleteMsg(msg, 30000, serverDisconnectIdle.client);
            }
        }
        else {
            let msg = await message.channel.send({embeds: [noSongs]});
            deleteMsg(msg, 30000, serverDisconnectIdle.client);
        }
    }
}