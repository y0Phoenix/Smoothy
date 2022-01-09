const {deleteMsg, leave} = require('../modules/modules');

module.exports = ping = {
    name: 'ping',
    description: "this is a ping command",
    ping(message, client){
        message.channel.send('pong') 
        .then(msg => deleteMsg(msg, 30000, false));
    }
}