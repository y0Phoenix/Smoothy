const { Client, Intents, Discord } = require('discord.js');
AbortController = require("node-abort-controller").AbortController;
const prefix = '-';
const play = require('./commands/play');
const leave = require('./commands/leave');
const stop = require('./commands/stop');
const skip = require('./commands/skip');
const ping = require('./commands/ping');
const queuelist = require('./commands/queue');
const remove = require('./commands/remove');
const help = require('./commands/help');
const pause= require('./commands/pause');
const resume = require('./commands/resume');
const loop = require('./commands/loop');
const loopsong = require('./commands/loopsong');
const repeat = require('./commands/repeat');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES] });
const queue = new Map();
const DisconnectIdle = new Map();
client.once('ready', () => {
    console.log('Smoothy 1.4 is online!');
    client.user.setActivity('-help', { type: 'LISTENING' })
});
client.once('recconnecting', () => {
    console.log('Smoothy is reconnecting!');
});
client.once('disconnect', () => {
    console.log('Disconnected!');
});
client.on('messageCreate', message =>{
    if(!message.content.startsWith(prefix) || message.author.bot){
        console.log('Message author was bot!');
        return;
    }
    var serverDisconnectIdle = DisconnectIdle.get(message.guild.id);
    var serverQueue = queue.get(message.guild.id);
    var vc = message.member.voice.channel;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    console.log("Command = " + command);
    if(command === 'ping'){
        ping.execute(message, args, vc, queue, DisconnectIdle, serverDisconnectIdle, serverQueue);
    }else if (command === 'play' || command === 'p'){
        play.play(message, args,  vc, queue, DisconnectIdle, serverDisconnectIdle, serverQueue,);
    }else if (command === 'queue' || command === 'list'){
        queuelist.execute(message, serverQueue);
    }else if (command === 'skip' || command === 'next' || command === 's' || command === 'n'){
        skip.skip(message, serverQueue);
    }else if (command === 'stop' || command === 'clear'){
        stop.stop(message, queue, serverQueue);
    }else if (command === 'leave' || command === 'disconnect' || command === 'dc' || command === 'die'){
        leave.leave(message, queue, serverQueue)
    }else if (command === 'remove' || command === 'r'){
        remove.remove(message, args, serverQueue)
    }else if (command === 'help'){
        help.help(message)
    }else if (command === 'pause'){
        pause.pause(message, serverQueue)
    }else if (command === 'resume'){
        resume.resume(message,serverQueue)
    }else if (command === 'crash'){
        snoopy_goes_wild.dummy = 'me';
    }else if (command === 'loop' || command === 'l'){
        loop.loop(message, serverQueue)
    }else if (command === 'loopsong' || command === 'ls'){
        loopsong.loopsong(message, serverQueue)
    }else if (command === 'repeat' || command === 'restart'){
        repeat.repeat(message, serverQueue)
    }else
        message.channel.send('Invalid Command Type -help To See Current Commands');
    return;
    
}); 
client.login('ODg3ODY5MjQzMjE4MDg3OTU2.YUKaqw.b70z4bJ2dclica2mbtMI0y2ZuUM');    

