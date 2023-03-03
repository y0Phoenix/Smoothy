//creates an embed message which lists out the current functionalites and info about Smoothy
import { Colors, EmbedBuilder, Message } from 'discord.js';
import sendMessage from '../modules/src/sendMessage';

/**
 * @param  {Message} message the users message
 * @description sends a help message to the text-channel
 */
 export default function help(message: Message){
    const helpEmbedBuilder = new EmbedBuilder()
    .setColor(Colors.DarkPurple)
    .setTitle('List Of Useful Info, Commands And Contact Info Associated With Smoothy')
    .setDescription(`https://github.com/y0Phoenix/Smoothy/blob/main/Help.md`)
    .setThumbnail('https://github.com/y0Phoenix/Smoothy/blob/development/pictures/Smoothy%20Logo.png?raw=true')
    
    sendMessage({embeds: [helpEmbedBuilder]}, message)
}