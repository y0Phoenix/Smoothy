import { MessageEmbed, Message, Client }  from "discord.js";
import * as fs from "fs";
import {deleteMsg, leave}  from '../modules/modules';
const File = './config/prefixes.json';
import Queue from '../Classes/Queue';

module.exports = {
    name: 'prefix',
    description: 'sets a prefix for a server',
    /**
     * @param  {Message} message the users message
     * @param  {any} args the users message without the command and prefix
     * @param  {Queue} serverQueue the current servers queue
     * @param  {any} data the data from the prefixes file
     * @param  {number} found the index of the currents servers prefix
     * @param  {Client} client the Smoothy client 
     * @description changes the current servers prefix in the data param with the found index and writes the new data back to the file
     */
    async changeprefix(message: Message, args: any, serverQueue: Queue, data: any, found: number, client: Client){
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
            .then(msg => deleteMsg(msg, 60000, client));
        }
        else{
            const specifyEmbed = new MessageEmbed()
                .setColor('RED')
                .setDescription(':thumbsdown: You Must Specify With A New Prefix')
            ;
            message.channel.send({embeds: [specifyEmbed]})
            .then(msg => deleteMsg(msg, 30000, client));
        }
    }
}