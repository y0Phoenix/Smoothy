//resumes the audioPlayer only if the audioPlayer is Paused
import { MessageEmbed, Message, Client } from 'discord.js';
import {AudioPlayerStatus,} from '@discordjs/voice';
import {deleteMsg, leave} from '../modules/modules';
import Queue from '../Classes/Queue';
module.exports = {
    name: 'resume',
    description: 'resumes the current song',
    /**
     * @param  {Message} message the users Message
     * @param  {Queue} serverQueue the current servers Queue
     * @param  {Client} client the Smoothy Client
     * @description unpauses the audioplayer inside the serverQueue
     */
    async resume(message: Message, serverQueue: Queue, client: Client){
        if(serverQueue){
            if(serverQueue.player.state.status === AudioPlayerStatus.Paused){
                serverQueue.player.unpause();
                const resumEmbed = new MessageEmbed()
                    .setColor('GREEN')
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
                message.channel.send({embeds: [resumEmbed]})
                .then(msg => deleteMsg(msg, 60000, client));
            }else{
                message.channel.send(`:rofl: Not Currently Paused :rofl:`)
                .then(msg => deleteMsg(msg, 30000, client));
            }

        }else{
            message.channel.send(`:rofl: Not Currently Paused :rofl:`)
            .then(msg => deleteMsg(msg, 30000, client));
        }
    }
    
}