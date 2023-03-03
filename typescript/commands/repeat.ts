import { AudioPlayerStatus } from "@discordjs/voice";
import { EmbedBuilder, Message, Client, Colors } from "discord.js";
import Queue from "../Classes/Queue";
import {deleteMsg, leave} from '../modules/modules';
import audioPlayerIdle from '../Classes/functions/audioPlayerIdle';
//stops the audioPlayer and sets serverQueue.repeat to true, which is used inside of executive.js

/**
 * @param  {Message} message the users Message
 * @param  {Queue} serverQueue the current servesQueue
 * @param  {Client} client the Smoothy Client
 * @description sets the repeat bool to true inside the serverQueue and stops the audioplayer inside the serverQueue which sets off {@link audioPlayerIdle}
 * which is an event listener on the audioplayer inside the serverQueue 
 */
export default function repeat(message: Message, serverQueue: Queue, client: Client){
    if(serverQueue){
        if (serverQueue.player.state.status !== AudioPlayerStatus.Paused) {
            if(serverQueue.songs.length > 0){
                serverQueue.player.stop();
                serverQueue.repeat = true
                const restartCurrentEmbed = new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setDescription(`:thumbsup: I Am Restarting ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})*** :arrows_counterclockwise:`)
                ;
                message.reply({embeds: [restartCurrentEmbed]})
                .then(msg => deleteMsg(msg, 60000, client));
            }
            else{
                const notPlayingEmbed = new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setDescription(`:rofl: Not Currently Playing Anything At The Moment`)
                ;
                message.reply({embeds: [notPlayingEmbed]})
                .then(msg => deleteMsg(msg, 30000, client));
            }
        }
        else {
            const pausedEmbed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription(':rofl: Please Unpause The Player Before Restarting')
            ;
            message.reply({embeds: [pausedEmbed]})
            .then(msg => deleteMsg(msg, 30000, client));
        }
    }
    else{
        const notPlayingEmbed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(`:rofl: Not Currently Playing Anything At The Moment`)
        ;
        message.reply({embeds: [notPlayingEmbed]})   
        .then(msg => deleteMsg(msg, 30000, client));     
    }
}