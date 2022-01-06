//creates an embed message which lists out the current functionalites and info about Smoothy
const { MessageEmbed } = require('discord.js');
module.exports = {
    name: 'help',
    description: 'displays current commands and their funstionalities',
    async help(message){
        const helpMessageEmbed = new MessageEmbed()
        .setColor('DARK_PURPLE')
        .setTitle('List Of Useful Info, Commands And Contact Info Associated With Smoothy')
        .setDescription(`https://github.com/y0Phoenix/Smoothy/blob/main/Help.md`)
        .setThumbnail('https://github.com/y0Phoenix/Smoothy/blob/main/Smoothy%20Logo.png?raw=true')
        
        message.channel.send({embeds: [helpMessageEmbed]})
    }
        
}
