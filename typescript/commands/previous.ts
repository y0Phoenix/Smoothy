import { AudioPlayerStatus } from "@discordjs/voice";
import { Colors, EmbedBuilder, Message } from "discord.js";
import { Idle } from "../Classes/Idle";
import Queue from "../Classes/Queue";
import { deleteMsg } from "../modules/modules";
import sendMessage from "../modules/src/sendMessage";

const noSongs = new EmbedBuilder()
    .setColor(Colors.Red)
    .setDescription(':rofl: Cant Play A Previous Song')
;

/**
 * @param  {Message} message the users message
 * @param  {Queue} serverQueue the current servers Queue
 * @param  {Idle} serverDisconnectIdle the current servers Idle
 * @description sets the previousbool inside serverQueue to true and stops the audioplayer inside serverQueue which sets off the idle event listener on the audioplayer
 */
export default async function previous(message: Message, serverQueue: Queue, serverDisconnectIdle: Idle) {
    if (serverQueue) {
        if (serverQueue.previous.length > 0) {
            if (serverQueue.player.state.status === AudioPlayerStatus.Playing) {
                serverQueue.previousbool = true;
                const previousEmbed = new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setDescription(`:thumbsup: Going Back To [${serverQueue.previous[0].title}](${serverQueue.previous[0].url})`)
                ;
                let msg = await sendMessage({embeds: [previousEmbed]}, message);
                deleteMsg(msg, 60000, serverDisconnectIdle.client);
                serverQueue.player.stop();
            }
            else {
                const pausedEmbed = new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setDescription(':rofl: Cant Play The Previos Song While Paused')
                ;
                let msg = await sendMessage({embeds: [pausedEmbed]}, message);
                deleteMsg(msg, 30000, serverDisconnectIdle.client);
            }
        }
        else {
            let msg = await sendMessage({embeds: [noSongs]}, message);
            deleteMsg(msg, 30000, serverDisconnectIdle.client);
        }
    }
    else {
        let msg = await sendMessage({embeds: [noSongs]}, message);
        deleteMsg(msg, 30000, serverDisconnectIdle.client);
    }
}