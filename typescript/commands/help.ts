//creates an embed message which lists out the current functionalites and info about Smoothy
import { MessageEmbed, Message } from 'discord.js';

/**
 * @param  {Message} message the users message
 * @description sends a help message to the text-channel
 */
 export default function help(message: Message){
    const helpMessageEmbed = new MessageEmbed()
    .setColor('DARK_PURPLE')
    .setTitle('List Of Useful Info, Commands And Contact Info Associated With Smoothy')
    .setDescription(`https://github.com/y0Phoenix/Smoothy/blob/main/Help.md`)
    .setThumbnail('https://github.com/y0Phoenix/Smoothy/blob/development/pictures/Smoothy%20Logo.png?raw=true')
    
    message.channel.send({embeds: [helpMessageEmbed]})
}