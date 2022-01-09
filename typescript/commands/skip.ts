//stops the audioPlayer which make AudioPlayerStatus Idle, which then exeuctes the function at ../executive.js(78)
import { MessageEmbed, Message, Client } from 'discord.js';
import Queue from '../Classes/Queue';
import {deleteMsg} from '../modules/modules';

/**
 * @param  {Message} message the users Messgae
 * @param  {Queue} serverQueue the current servers Queue
 * @param  {Client} client the Smoothy Client
 * @description stops the audioplayer inside the serverQueue which sets of {@link audioPlayerIdle} via an audioplayer event listener inside the serverQueue
 */
 export default async function skip(message: Message, serverQueue: Queue, client: Client) {    
    if(serverQueue !== undefined){
        if (serverQueue.songs.length > 0 ) {
            try {
                console.log("Skipping " + serverQueue.currentsong[0].title + "!");
                const skipEmbed = new MessageEmbed()
                    .setColor('AQUA')
                    .setTitle(`:next_track: Skipping`)
                    .setDescription(` ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})***`)
                    .addFields(
                        {
                            name: `Requested By` , value: `<@${message.author.id}>`, inline: true,
                        },
                        {
                            name: `***Duration***`, value: `${serverQueue.currentsong[0].duration}`, inline: true
                        }
                    )
                ;
                message.channel.send({embeds: [skipEmbed]})
                .then(msg => deleteMsg(msg, 60000, client));
                serverQueue.player.stop();  
                }
                catch(error) {
                    console.log('Unknown MSG');
                }
        }else{
            message.channel.send(':rofl: Nothing To ***Skip*** :rofl:')
            .then(msg => deleteMsg(msg, 30000, client));
        }
    }
}