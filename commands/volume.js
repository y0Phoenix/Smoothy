const { MessageEmbed } = require("discord.js");
const smoothy = require('../modules');
var volume = undefined;

const noSongEmbed = new MessageEmbed()
    .setColor('RED')
    .setDescription(':rofl: No Song To Change Volume')
;

var volumeEmbed = new MessageEmbed()
    .setColor('GOLD')
    .setDescription(`:thumbsup: Volume Is Now ${volume}`)
    .setTimestamp()
;

module.exports = {
    name: 'volume',
    description: 'changes the volume for the serverQueues resource',
    async execute(message, args, serverQueue){
        if(args.length > 0){
            if(serverQueue){
                args = args[0].toLowerCase();
                if(args === 'default' || args === 'reset' || args === 'de' || args === 're'){
                    volume = 1;
                    serverQueue.resource.volume.volume = volume;
                    message.channel.send({embeds: [volumeEmbed]});
                }
                else{
                    volume = parseInt(args);
                    if(serverQueue.songs.length > 0){
                        if(args <= 100){
                            serverQueue.resource.volume.volume = volume;
                            message.channel.send({embeds: [volumeEmbed]});
                        }
                        else{
                            const toHighEmbed = new MessageEmbed()
                                .setColor('RED')
                                .setDescription(':rofl: Volume is 100 max')
                            ;
                            message.channel.send({embeds: [toHighEmbed]})
                            .then(msg => smoothy.deleteMsg(msg, 30000));
                        }
                    }
                    else{
                        message.channel.send({embeds: [noSongEmbed]})
                        .then(msg => smoothy.deleteMsg(msg, 30000));
                    }
                }
            }
            else{
                message.channel.send({embeds: [noSongEmbed]})
                .then(msg => smoothy.deleteMsg(msg, 30000));
            }
        }
        else{
            const specifyEmbed = new MessageEmbed()
                .setColor('RED')
                .setDescription(':rofl: You Must Specify With A Number')
            ;
            message.channel.send({embeds: [specifyEmbed]})
            .then(msg => smoothy.deleteMsg(msg, 30000));
        }
    }
}