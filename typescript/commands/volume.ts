import { MessageEmbed, Message } from "discord.js";
import { Idle } from "../Classes/Idle";
import Queue from "../Classes/Queue";
import {deleteMsg, leave, writeGlobal} from '../modules/modules';

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

module.exports = {
    name: 'volume',
    description: 'changes the volume for the serverQueues resource',
    /**
     * @param  {Message} message the users Message
     * @param  {any} args the users Message content without the command or prefix
     * @param  {Queue} serverQueue the current server Queue
     * @param  {Idle} serverDisconnectIdle the current servers Idle
     * @description sets the volume number inside serverQueue.resources' audiioResource
     */
    async volume(message: Message, args: any, serverQueue: Queue, serverDisconnectIdle: Idle){
        let volume;
        if(args.length > 0){
            if(serverQueue){
                args = args[0].toLowerCase();
                if(args === 'default' || args === 'reset' || args === 'de' || args === 're'){
                    volume = 1;
                    serverQueue.resource.volume.volume = volume;
                    let embed = volumeE(volume);
                    let msg = await message.channel.send({embeds: [embed]});
                    serverDisconnectIdle.msgs.push(msg);
                    writeGlobal('update dci', serverDisconnectIdle, serverQueue.id);
                }
                else{
                    volume = parseInt(args);
                    if(serverQueue.songs.length > 0){
                        if(args <= 100){
                            serverQueue.resource.volume.volume = volume;
                            let embed = volumeE(volume);
                            let msg = await message.channel.send({embeds: [embed]});
                            serverDisconnectIdle.msgs.push(msg);
                            writeGlobal('update dci', serverDisconnectIdle, serverDisconnectIdle.id);
                        }
                        else{
                            const toHighEmbed = new MessageEmbed()
                                .setColor('RED')
                                .setDescription(':rofl: Volume is 100 max')
                            ;
                            message.channel.send({embeds: [toHighEmbed]})
                            .then(msg => deleteMsg(msg, 30000, serverDisconnectIdle.client));
                        }
                    }
                    else{
                        message.channel.send({embeds: [noSongEmbed]})
                        .then(msg => deleteMsg(msg, 30000, serverDisconnectIdle.client));
                    }
                }
            }
            else{
                message.channel.send({embeds: [noSongEmbed]})
                .then(msg => deleteMsg(msg, 30000, serverDisconnectIdle.client));
            }
        }
        else{
            const specifyEmbed = new MessageEmbed()
                .setColor('RED')
                .setDescription(':rofl: You Must Specify With A Number')
            ;
            message.channel.send({embeds: [specifyEmbed]})
            .then(msg => deleteMsg(msg, 30000, serverDisconnectIdle.client));
        }
    }
}