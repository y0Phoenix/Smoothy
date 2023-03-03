import { EmbedBuilder, Message, Client, Colors }  from "discord.js";
import * as fs from "fs";
import {deleteMsg, leave}  from '../modules/modules';
const File = './config/prefixes.json';
import Queue from '../Classes/Queue';

/**
 * @param  {Message} message the users message
 * @param  {any} args the users message without the command and prefix
 * @param  {any} data the data from the prefixes file
 * @param  {number} found the index of the currents servers prefix
 * @param  {Client} client the Smoothy client 
 * @description changes the current servers prefix in the data param with the found index and writes the new data back to the file
 */
export default function changeprefix(message: Message, args: any, data: any, found: number, client: Client){
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
        const prefixEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .addFields(
                {
                    name: ':thumbsup: New Prefix', value:`**${prefix}**`
                }
            )
        ;
        message.reply({embeds: [prefixEmbed]})
        .then(msg => deleteMsg(msg, 60000, client));
    }
    else{
        const specifyEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(':thumbsdown: You Must Specify With A New Prefix')
        ;
        message.reply({embeds: [specifyEmbed]})
        .then(msg => deleteMsg(msg, 30000, client));
    }
}