//checks if a link was specified, if the user is inside of a voiceChannel, if Smoothy has permission to connect and if Smoothy has permission to speak
//then joins the voiceChannel and finds the video. Both functions are inside of executive.js 
import { MessageEmbed, Message, Client } from 'discord.js';
import { Idle } from '../Classes/Idle';
import Queue from '../Classes/Queue';
import {joinvoicechannel, FindVideoCheck, findvideoplaylist} from '../executive';
import {deleteMsg, exists} from '../modules/modules';
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

/**
 * @param  {Message} message the users message
 * @param  {any} args the users message content without the command and prefix
 * @param  {Message['member']['voice']['channel']} vc the users voice channel
 * @param  {any} queue the map that hold all of the Queue
 * @param  {any} DisconnectIdle the map that hold all of the Idles
 * @param  {Idle} serverDisconnectIdle the current servers Idle
 * @param  {Queue} serverQueue the current servers Queue
 * @param  {string} command the command from the user
 * @param  {Client} client the Smoothy client
 * @description check conditions inorder for Smoothy to play a song then joins the vc and plays whatever song or playlist the user entered
 */
export default async function play(message: Message, args: any,  vc: Message['member']['voice']['channel'], queue: any, 
DisconnectIdle: any, serverDisconnectIdle: Idle, serverQueue: Queue, command: string, client: Client) {
    try{
        if (args.length === 0) return message.channel.send({embeds: [specifyEmbed]})
        .then(msg => deleteMsg(msg, 30000, serverDisconnectIdle.client));
        if (!vc) return message.channel.send({embeds: [needVCEmbed]})
        .then(msg => deleteMsg(msg, 30000, serverDisconnectIdle.client));
        const permissions = vc.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT')) return message.channel.send({embeds: [connectEmbed]})
        .then(msg => deleteMsg(msg, 30000, serverDisconnectIdle.client));
        if (!permissions.has('SPEAK')) return message.channel.send({embeds: [speakEmbed]})
        .then(msg => deleteMsg(msg, 30000, serverDisconnectIdle.client));
        
        const bool = await exists(message.guildId, 'dci');
        if(command !== null && command === 'pp' || command === 'playp'){
            await joinvoicechannel(message, vc, DisconnectIdle, serverDisconnectIdle, client, bool);
            const sdi = DisconnectIdle.get(message.guild.id);
            findvideoplaylist(message, args, queue, DisconnectIdle, sdi, serverQueue)
        }
        else{
            await joinvoicechannel(message, vc, DisconnectIdle, serverDisconnectIdle, client, bool);
            const sdi = DisconnectIdle.get(message.guild.id);
            FindVideoCheck(message, args, queue, DisconnectIdle, sdi, serverQueue); 
        }
        
    }
    catch(error) {
        console.error(error);
    }
}
