import { MessageEmbed, Message } from "discord.js";
import { Idle } from "../Classes/Idle";
import Queue from "../Classes/Queue";
import {deleteMsg, leave, writeGlobal} from '../modules/modules';
import getMaps from "../maps";

const noSongEmbed = new MessageEmbed()
    .setColor('RED')
    .setDescription(':rofl: No Song To Change Volume')
;

function volumeE(v) {
    const volumeEmbed = new MessageEmbed()
        .setColor('GOLD')
        .setDescription(`:thumbsup: Volume Is Now ${v}`)
        .setTimestamp()
    ;
    return volumeEmbed;
}
/**
 * @param  {Message} message the users Message
 * @param  {any} args the users Message content without the command or prefix
 * @param  {Queue} serverQueue the current server Queue
 * @param  {Idle} serverDisconnectIdle the current servers Idle
 * @description sets the volume number inside serverQueue.resources' audiioResource
 */
export default async function volume(message: Message, args: any, serverQueue: Queue, serverDisconnectIdle: Idle){
    let volume;
    const {DisconnectIdle} = getMaps();
    if(args.length > 0){
        if(serverQueue){
            args = args[0].toLowerCase();
            if(args === 'default' || args === 'reset' || args === 'de' || args === 're'){
                volume = 1;
                serverQueue.resource.volume.volume = volume;
                let embed = volumeE(volume);
                let msg = await message.channel.send({embeds: [embed]});
                deleteMsg(msg, 60000, DisconnectIdle.get(1));
                writeGlobal('update dci', serverDisconnectIdle, serverQueue.id);
            }
            else{
                volume = parseInt(args);
                if(serverQueue.songs.length > 0){
                    if(args <= 100){
                        serverQueue.resource.volume.volume = volume;
                        let embed = volumeE(volume);
                        let msg = await message.channel.send({embeds: [embed]});
                        deleteMsg(msg, 60000, DisconnectIdle.get(1));
                        writeGlobal('update dci', serverDisconnectIdle, serverDisconnectIdle.id);
                    }
                    else{
                        const toHighEmbed = new MessageEmbed()
                            .setColor('RED')
                            .setDescription(':rofl: Volume is 100 max')
                        ;
                        message.channel.send({embeds: [toHighEmbed]})
                        .then(msg => deleteMsg(msg, 30000, DisconnectIdle.get(1)));
                    }
                }
                else{
                    message.channel.send({embeds: [noSongEmbed]})
                    .then(msg => deleteMsg(msg, 30000, DisconnectIdle.get(1)));
                }
            }
        }
        else{
            message.channel.send({embeds: [noSongEmbed]})
            .then(msg => deleteMsg(msg, 30000, DisconnectIdle.get(1)));
        }
    }
    else{
        const specifyEmbed = new MessageEmbed()
            .setColor('RED')
            .setDescription(':rofl: You Must Specify With A Number')
        ;
        message.channel.send({embeds: [specifyEmbed]})
        .then(msg => deleteMsg(msg, 30000, DisconnectIdle.get(1)));
    }
}