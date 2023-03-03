//removes a specified song inside of serverQueue using a number inside of args
import { EmbedBuilder, Message, Client, Colors } from 'discord.js';
import Queue from '../Classes/Queue';
import {deleteMsg, writeGlobal, find} from '../modules/modules';

/**
 * @param  {Message} message the users Message
 * @param  {any} args the users message content without the command and prefix
 * @param  {Queue} serverQueue the current serversQueue
 * @param  {Client} client the Smoothy Client
 * @description removes a song from the serverQueue via searchquery or index
 */
export default async function remove(message: Message, args: any, serverQueue: Queue, client: Client) {
    var i = parseInt(args);
    var query = args.join(' ');
    if (isNaN(i)) {
        const result = await find(serverQueue, query);
        if (!result.error) {
            if (result.shuffledSong) {
                i = result.shuffledSong;
                serverQueue.songs.splice(result.song, 1);
            }
            else {
                i = result.song;
            }
        }
        else {
            const msg = await message.reply({embeds: [new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription(`:rofl: No Good Matches found for **${query}** please check your spelling or remove a song via a number from the -queue`)]});
            deleteMsg(msg, 60000, client);
            return;
        }
    }
    if(serverQueue.shuffle === true){
        const result = await find(serverQueue, serverQueue.shuffledSongs[i].title);
        serverQueue.songs.splice(result.song, 1);
        if(serverQueue.shuffledSongs[i]){
            const removeEmbed = new EmbedBuilder()
                .setColor(Colors.Blurple)
                .setDescription(`I Have Removed ***[${serverQueue.shuffledSongs[i].title}](${serverQueue.shuffledSongs[i].url})***`)
                .addFields(
                    {
                        name: `Requested By` , value: `<@${message.author.id}>`, inline: true,
                    },
                    {
                        name: `***Duration***`, value: `${serverQueue.shuffledSongs[i].duration}`, inline: true
                    })
            message.reply({embeds: [removeEmbed]})
            .then(msg => deleteMsg(msg, 60000, client));   
            serverQueue.shuffledSongs.splice(i, 1);
            writeGlobal('update queue', serverQueue, serverQueue.id);
        }
        else{
            message.reply('No Song Specified')
            .then(msg => deleteMsg(msg, 30000, client));
        }
    }
    else{
        if(serverQueue.songs[i]){
            const removeEmbed = new EmbedBuilder()
                .setColor(Colors.Blurple)
                .setTitle(':eject: Removing Song')
                .setURL(`${serverQueue.songs[i].url}`)
                .setDescription(`I Have Removed ***[${serverQueue.songs[i].title}](${serverQueue.songs[i].url})***`)
                .addFields(
                    {
                        name: `Requested By` , value: `<@${message.author.id}>`, inline: true,
                    },
                    {
                        name: `***Duration***`, value: `${serverQueue.songs[i].duration}`, inline: true
                    })
                .setThumbnail(`${serverQueue.songs[i].thumbnail}`)
                .setTimestamp();
            message.reply({embeds: [removeEmbed]})
            .then(msg => deleteMsg(msg, 60000, client));   
            serverQueue.songs.splice(i, 1);
            writeGlobal('update queue', serverQueue, serverQueue.id);
        }
        else{
            message.reply('No Song Specified')
            .then(msg => deleteMsg(msg, 30000, client));
        }
    }
}