const { MessageEmbed } = require("discord.js");
const smoothy = require('../modules');

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
    async execute(message, args, serverQueue, serverDisconnectIdle){
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
                }
                else{
                    volume = parseInt(args);
                    if(serverQueue.songs.length > 0){
                        if(args <= 100){
                            serverQueue.resource.volume.volume = volume;
                            let embed = volumeE(volume);
                            let msg = await message.channel.send({embeds: [embed]});
                            serverDisconnectIdle.msgs.push(msg);
                        }
                        else{
                            const toHighEmbed = new MessageEmbed()
                                .setColor('RED')
                                .setDescription(':rofl: Volume is 100 max')
                            ;
                            message.channel.send({embeds: [toHighEmbed]})
                            .then(msg => smoothy.deleteMsg(msg, 30000, false));
                        }
                    }
                    else{
                        message.channel.send({embeds: [noSongEmbed]})
                        .then(msg => smoothy.deleteMsg(msg, 30000, false));
                    }
                }
            }
            else{
                message.channel.send({embeds: [noSongEmbed]})
                .then(msg => smoothy.deleteMsg(msg, 30000, false));
            }
        }
        else{
            const specifyEmbed = new MessageEmbed()
                .setColor('RED')
                .setDescription(':rofl: You Must Specify With A Number')
            ;
            message.channel.send({embeds: [specifyEmbed]})
            .then(msg => smoothy.deleteMsg(msg, 30000, false));
        }
    }
}