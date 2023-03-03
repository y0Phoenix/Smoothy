import {deleteMsg} from '../modules/modules';
import {Message, Client} from 'discord.js';
import sendMessage from '../modules/src/sendMessage';

export default function ping(message: Message, client: Client){
    sendMessage('pong', message) 
    .then(msg => deleteMsg(msg, 30000, client));
}