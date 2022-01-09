import { AudioPlayerStatus } from "@discordjs/voice";
import { MessageEmbed, Message, Client } from "discord.js";
import Queue from "../Classes/Queue";
import {deleteMsg, leave} from '../modules/modules';
import audioPlayerIdle from '../Classes/functions/audioPlayerIdle';
//stops the audioPlayer and sets serverQueue.repeat to true, which is used inside of executive.js
module.exports = {
    name: 'repeat',
    description: 'repeats the current song',
    /**
     * @param  {Message} message the users Message
     * @param  {Queue} serverQueue the current servesQueue
     * @param  {Client} client the Smoothy Client
     * @description sets the repeat bool to true inside the serverQueue and stops the audioplayer inside the serverQueue which sets off {@link audioPlayerIdle}
     * which is an event listener on the audioplayer inside the serverQueue 
     */
    repeat(message: Message, serverQueue: Queue, client: Client){
        if(serverQueue){
            if (serverQueue.player.state.status !== AudioPlayerStatus.Paused) {
                if(serverQueue.songs.length > 0){
                    serverQueue.player.stop();
                    serverQueue.repeat = true
                    const restartCurrentEmbed = new MessageEmbed()
                        .setColor('GREEN')
                        .setDescription(`:thumbsup: I Am Restarting ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})*** :arrows_counterclockwise:`)
                    ;
                    message.channel.send({embeds: [restartCurrentEmbed]})
                    .then(msg => deleteMsg(msg, 60000, client));
                }
                else{
                    const notPlayingEmbed = new MessageEmbed()
                        .setColor('GREEN')
                        .setDescription(`:rofl: Not Currently Playing Anything At The Moment`)
                    ;
                    message.channel.send({embeds: [notPlayingEmbed]})
                    .then(msg => deleteMsg(msg, 30000, client));
                }
            }
            else {
                const pausedEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setDescription(':rofl: Please Unpause The Player Before Restarting')
                ;
                message.channel.send({embeds: [pausedEmbed]})
                .then(msg => deleteMsg(msg, 30000, client));
            }
        }
        else{
            const notPlayingEmbed = new MessageEmbed()
                .setColor('GREEN')
                .setDescription(`:rofl: Not Currently Playing Anything At The Moment`)
            ;
            message.channel.send({embeds: [notPlayingEmbed]})   
            .then(msg => deleteMsg(msg, 30000, client));     
        }
    }
}