import {deleteMsg} from '../modules/modules';
import {Message, Client} from 'discord.js';

export default function ping(message: Message, client: Client){
    message.reply('pong') 
    .then(msg => deleteMsg(msg, 30000, client));
}