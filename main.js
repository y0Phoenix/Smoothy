// This is the Main File for Smoothy Developed by Eugene aka y0Phoenix 
// This is where the client is created and messages come in from discord and are converted into commands and args 
const { Client, Intents, Discord, MessageEmbed } = require('discord.js');
AbortController = require("node-abort-controller").AbortController;
const {play} = require('./commands/play');
const {leave} = require('./commands/leave');
const {stop} = require('./commands/stop');
const {skip} = require('./commands/skip');
const {ping} = require('./commands/ping');
const {queuelist} = require('./commands/queue');
const {remove} = require('./commands/remove');
const {help} = require('./commands/help');
const {pause}= require('./commands/pause');
const {resume} = require('./commands/resume');
const {loop} = require('./commands/loop');
const {loopsong} = require('./commands/loopsong');
const {repeat} = require('./commands/repeat');
const {shuffle} = require('./commands/shuffle');
const {jump} = require('./commands/jump');
const {changeprefix} = require('./commands/change prefix')
const {volume} = require('./commands/volume');
const { previous } = require('./commands/previous');
const fs = require('fs');
//Creates the client
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES] });
const queue = new Map();
const DisconnectIdle = new Map();

client.once('ready', () => {
    console.log('Smoothy 1.4.5 is online!');
    client.user.setActivity('-help', { type: 'LISTENING' })
});
client.once('recconnecting', () => {
    console.log('Smoothy is reconnecting!');
});
client.once('disconnect', () => {
    console.log('Disconnected!');
});
//creates a message from discord with all the info about the user, server, voicechannel and text channel
client.on('messageCreate', message =>{
    if(message.author.bot){
        return;
    }
    var file = fs.readFileSync('./commands/config.json');
    var data = JSON.parse(file);
    let prefix = undefined;
    let found = 0;
    for(j=0;
        prefix === undefined;
        j++){
            if(data.length === j){
                prefix = data[0].prefix;
                found = 0;
            }
            else{
                const exists = data[j].guildId === message.guild.id;
                if(exists){
                    prefix = data[j].prefix;
                    found = j;
                    break;
                }
            }
        }
    if(message.content === 'myprefix'){
        const myprefixEmbed = new MessageEmbed()
            .setColor('BLUE')
            .addFields(
                {
                name: ':thumbsup: Current Prefix',value: `**${prefix}**`
                }
            )
        ;   
        message.channel.send({embeds: [myprefixEmbed]})
        .then(msg => {
            setTimeout(() => {
                msg.delete(), 30000
            })
        });
        console.log(`Send current prefix ${prefix} to the channel`);
        return;
    }
    if(!message.content.startsWith(prefix)){
        return;
    }
    var serverDisconnectIdle = DisconnectIdle.get(message.guild.id);
    var serverQueue = queue.get(message.guild.id);
    var vc = message.member.voice.channel;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    console.log(`Command = ${command} ${args.join(' ')}`);
    //commands come in and checks if command ===, else the command was invalid
    if(command === 'ping'){
        ping(message);
    }else if (command === 'play' || command === 'p' || command === 'pp' || command === 'playp'){
        play(message, args,  vc, queue, DisconnectIdle, serverDisconnectIdle, serverQueue, command);
    }else if (command === 'queue' || command === 'list' || command === 'q'){
        queuelist(message, serverQueue, serverDisconnectIdle);
    }else if (command === 'skip' || command === 'next' || command === 's' || command === 'n'){
        skip(message, serverQueue);
    }else if (command === 'stop' || command === 'clear'){
        stop(message, serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
    }else if (command === 'leave' || command === 'disconnect' || command === 'dc' || command === 'die'){
        leave(message, queue, serverQueue, DisconnectIdle, serverDisconnectIdle);
    }else if (command === 'remove' || command === 'r'){
        remove(message, args, serverQueue);
    }else if (command === 'help'){
        help(message);
    }else if (command === 'pause' || command === 'pa'){
        pause(message, serverQueue);
    }else if (command === 'resume' || command === 'un'){
        resume(message,serverQueue);
    }else if (command === 'crash' || command === 'c'){
        snoopy_goes_wild.dummy = 'me';
    }else if (command === 'loop' || command === 'l'){
        loop(message, serverQueue, serverDisconnectIdle);
    }else if (command === 'loopsong' || command === 'ls'){
        loopsong(message, serverQueue, serverDisconnectIdle);
    }else if (command === 'repeat' || command === 'restart' || command === 're'){
        repeat(message, serverQueue);
    }else if (command === 'shuffle' || command === 'mix'){
        shuffle(message, serverQueue);
    }else if (command === 'jump' || command === 'j'){
        jump(message, args, serverQueue, serverDisconnectIdle);
    }else if (command === 'prefix' || command === 'changeprefix' || command === 'prefixchange'){
        changeprefix(message, args, serverQueue, data, found)
    }else if (command === 'volume' || command === 'v'){
        volume(message, args, serverQueue, serverDisconnectIdle)
    }else if (command === 'previous' || command === 'pr') {
        previous(message, args, serverQueue, serverDisconnectIdle);
    }else{
        const invalidCommandEmbed = new MessageEmbed()
            .setColor(`RED`)
            .setDescription(`:rofl: Invalid Command Type -help To See Current Commands`)
        ;
        message.channel.send({embeds: [invalidCommandEmbed]})
        .then(msg => {
            setTimeout(() => {
                msg.delete()
            }, 30000)
        });
    return;
    }
}); 
client.login('ODg3ODY5MjQzMjE4MDg3OTU2.YUKaqw.GARSjc-wWSKU_ghZT0E8NYmquL0');    

