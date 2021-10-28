//checks if a link was specified, if the user is inside of a voiceChannel, if Smoothy has permission to connect and if Smoothy has permission to speak
//then joins the voiceChannel and finds the video. Both functions are inside of executive.js 
const { MessageEmbed } = require('discord.js');
const executive = require('../executive');
const needVCEmbed = new MessageEmbed()
    .setColor('RED')
    .setDescription(':nerd: You Need To Be In A ***Voice Channel*** To Execute This Command')
;
const specifyEmbed = new MessageEmbed()
    .setColor('RED')
    .setDescription(':nerd: You Need To Specify With Either A ***Link*** Or ***Search*** ***Query***')
;
const connectEmbed = new MessageEmbed()
    .setColor('RED')
    .setDescription(':nerd: I Dont Have The ***Permission To Connect***')
;
const speakEmbed = new MessageEmbed()
    .setColor('RED')
    .setDescription(':nerd: I Dont Have The ***Permissins To Speak*** ')
;
module.exports = {
    name:'play',
    description: 'plays the specified song',
    async play(message, args,  vc, queue, DisconnectIdle, serverDisconnectIdle, serverQueue, command) {
        try{
            if (args.length === 0) return message.channel.send({embeds: [specifyEmbed]});
            if (!vc) return message.channel.send({embeds: [needVCEmbed]});
            const permissions = vc.permissionsFor(message.client.user);
            if (!permissions.has('CONNECT')) return message.channel.send({embeds: [connectEmbed]});
            if (!permissions.has('SPEAK')) return message.channel.send({embeds: [speakEmbed]});
            
            if(command === 'pp' || command === 'playp'){
                executive.joinvoicechannel(message, vc, DisconnectIdle, serverDisconnectIdle);
                executive.findvideoplaylist(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue)
            }
            else{
                executive.joinvoicechannel(message, vc, DisconnectIdle, serverDisconnectIdle);
                executive.FindVideoCheck(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue); 
            }
            
        }
        catch(error) {
            console.error(error);
        }
    }
}
