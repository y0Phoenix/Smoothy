import {deleteMsg, leave} from '../modules/modules';
import {Message, Client} from 'discord.js';

module.exports = {
    name: 'ping',
    description: "this is a ping command",
    ping(message: Message, client: Client){
        message.channel.send('pong') 
        .then(msg => deleteMsg(msg, 30000, client));
    }
}