//checks if a link was specified, if the user is inside of a voiceChannel, if Smoothy has permission to connect and if Smoothy has permission to speak
//then joins the voiceChannel and finds the video. Both functions are inside of executive.js 
const { MessageEmbed } = require('discord.js');
const {joinvoicechannel, FindVideoCheck, findvideoplaylist} = require('../executive');
const {deleteMsg, exists} = require('../modules/modules');
require('typescript-require');
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
    async play(message, args,  vc, queue, DisconnectIdle, serverDisconnectIdle, serverQueue, command, client) {
        try{
            if (args.length === 0) return message.channel.send({embeds: [specifyEmbed]})
            .then(msg => deleteMsg(msg, 30000, false));
            if (!vc) return message.channel.send({embeds: [needVCEmbed]})
            .then(msg => deleteMsg(msg, 30000, false));
            const permissions = vc.permissionsFor(message.client.user);
            if (!permissions.has('CONNECT')) return message.channel.send({embeds: [connectEmbed]})
            .then(msg => deleteMsg(msg, 30000, false));
            if (!permissions.has('SPEAK')) return message.channel.send({embeds: [speakEmbed]})
            .then(msg => deleteMsg(msg, 30000, false));
            
            const bool = await exists(message.guildId, 'dci');
            if(command !== null && command === 'pp' || command === 'playp'){
                await joinvoicechannel(message, vc, DisconnectIdle, serverDisconnectIdle, client, bool);
                findvideoplaylist(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue)
            }
            else{
                await joinvoicechannel(message, vc, DisconnectIdle, serverDisconnectIdle, client, bool);
                FindVideoCheck(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue); 
            }
            
        }
        catch(error) {
            console.error(error);
        }
    }
}
