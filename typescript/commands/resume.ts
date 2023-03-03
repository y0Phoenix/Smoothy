//resumes the audioPlayer only if the audioPlayer is Paused
import { EmbedBuilder, Message, Client, Colors } from 'discord.js';
import {AudioPlayerStatus,} from '@discordjs/voice';
import {deleteMsg, leave} from '../modules/modules';
import Queue from '../Classes/Queue';
import sendMessage from '../modules/src/sendMessage';

/**
 * @param  {Message} message the users Message
 * @param  {Queue} serverQueue the current servers Queue
 * @param  {Client} client the Smoothy Client
 * @description unpauses the audioplayer inside the serverQueue
 */
export default async function resume(message: Message, serverQueue: Queue, client: Client){
    if(serverQueue){
        if(serverQueue.player.state.status === AudioPlayerStatus.Paused){
            serverQueue.player.unpause();
            const resumEmbed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setDescription(`I Have Resumed ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})***`)
                .addFields(
                    {
                        name: `Requested By` , value: `<@${message.author.id}>`, inline: true,
                    },
                    {
                        name: `***Duration***`, value: `${serverQueue.currentsong[0].duration}`, inline: true
                    }
                )
            ;
            sendMessage({embeds: [resumEmbed]}, message)
            .then(msg => deleteMsg(msg, 60000, client));
        }else{
            sendMessage(`:rofl: Not Currently Paused :rofl:`, message)
            .then(msg => deleteMsg(msg, 30000, client));
        }

    }else{
        sendMessage(`:rofl: Not Currently Paused :rofl:`, message)
        .then(msg => deleteMsg(msg, 30000, client));
    }
}