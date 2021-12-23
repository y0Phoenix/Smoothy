const {deleteMsg, leave} = require('../modules');

module.exports = ping = {
    name: 'ping',
    description: "this is a ping command",
    ping(message){
        message.channel.send('pong') 
        .then(msg => deleteMsg(msg, 30000, false));
    }
}