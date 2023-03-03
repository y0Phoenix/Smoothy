//pauses the song at the front of the serverQueue
import { EmbedBuilder, Message, Client, Colors } from 'discord.js';
import Queue from '../Classes/Queue';
import {deleteMsg, leave} from '../modules/modules';
import sendMessage from '../modules/src/sendMessage';

/**
 * @param  {Message} message the users message
 * @param  {Queue} serverQueue the current servers Queue
 * @param  {Client} client the Smoothy Client
 * @description pauses the audioplayer inside the serverQueue
 */
export default function pause(message: Message, serverQueue: Queue, client: Client){
    if(serverQueue !== undefined){
        serverQueue.player.pause();
        const pauseEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(`I Have Paused ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})***`)
            .addFields(
                {
                    name: `Help`, value: "You Can Resume By Typing ***-resume***"
                },
                {
                    name: `Requested By` , value: `<@${message.author.id}>`, inline: true,
                },
                {
                    name: `***Duration***`, value: `${serverQueue.currentsong[0].duration}`, inline: true
                }
            )
        ;
        sendMessage({embeds: [pauseEmbed]}, message)
        .then(msg => deleteMsg(msg, 60000, client));
    }
    else{
        sendMessage(`:rofl: Nothing To Pause :rofl:`, message)
        .then(msg => deleteMsg(msg, 30000, client));
    }
}