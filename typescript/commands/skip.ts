//stops the audioPlayer which make AudioPlayerStatus Idle, which then exeuctes the function at ../executive.js(78)
import { AudioPlayerStatus } from '@discordjs/voice';
import { EmbedBuilder, Message, Client, Colors } from 'discord.js';
import Queue from '../Classes/Queue';
import {deleteMsg} from '../modules/modules';
import sendMessage from '../modules/src/sendMessage';

/**
 * @param  {Message} message the users Messgae
 * @param  {Queue} serverQueue the current servers Queue
 * @param  {Client} client the Smoothy Client
 * @description stops the audioplayer inside the serverQueue which sets of {@link audioPlayerIdle} via an audioplayer event listener inside the serverQueue
 */
 export default async function skip(message: Message, serverQueue: Queue, client: Client) {    
    if(serverQueue !== undefined){
        if (serverQueue.songs.length > 0 ) {
            if (serverQueue.player.state.status === AudioPlayerStatus.Paused) {
                const msg = await sendMessage({embeds: [new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setDescription(':rofl: Please Unpause The Player Before Restarting')
                ]}, message);
                deleteMsg(msg, 30000, client);
            }
            try {
                console.log("Skipping " + serverQueue.currentsong[0].title + "!");
                const skipEmbed = new EmbedBuilder()
                    .setColor(Colors.Aqua)
                    .setTitle(`:next_track: Skipping`)
                    .setDescription(` ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})***`)
                    .addFields(
                        {
                            name: `Requested By` , value: `<@${message.author.id}>`, inline: true,
                        },
                    )
                ;
                sendMessage({embeds: [skipEmbed]}, message)
                .then(msg => deleteMsg(msg, 60000, client));
                serverQueue.player.stop();  
                }
                catch(error) {
                    console.log('Unknown MSG');
                }
        }else{
            sendMessage(':rofl: Nothing To ***Skip*** :rofl:', message)
            .then(msg => deleteMsg(msg, 30000, client));
        }
    }
}