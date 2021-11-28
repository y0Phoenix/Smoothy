const smoothy = require('../modules');

module.exports = ping = {
    name: 'ping',
    description: "this is a ping command",
    execute(message){
        message.channel.send('pong') 
        .then(msg => smoothy.deleteMsg(msg, 30000));
    }
}