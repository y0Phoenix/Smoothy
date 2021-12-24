const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const {deleteMsg, leave} = require('../modules/modules');
const File = './config/prefixes.json';

module.exports = {
    name: 'prefix',
    description: 'sets a prefix for a server',
    async changeprefix(message, args, serverQueue, data, found){
        if(args.length > 0){
            let prefix = args[0];
            if(found === 0){
                data.push({guildId: message.guildId,prefix: prefix});
                fs.writeFileSync(File, JSON.stringify(data));
            }
            else if(found > 0){
                data[found].prefix = prefix;
                fs.writeFileSync(File, JSON.stringify(data));
            }
            const prefixEmbed = new MessageEmbed()
                .setColor('RED')
                .addFields(
                    {
                        name: ':thumbsup: New Prefix', value:`**${prefix}**`
                    }
                )
            ;
            message.channel.send({embeds: [prefixEmbed]})
            .then(msg => deleteMsg(msg, 60000, false));
        }
        else{
            const specifyEmbed = new MessageEmbed()
                .setColor('RED')
                .setDescription(':thumbsdown: You Must Specify With A New Prefix')
            ;
            message.channel.send({embeds: [specifyEmbed]})
            .then(msg => deleteMsg(msg, 30000, false, false));
        }
    }
}