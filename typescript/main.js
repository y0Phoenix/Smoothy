// This is the Main File for Smoothy Developed by Eugene aka y0Phoenix 
// This is where the client is created and messages come in from discord and are converted into commands and args 
const { Client, Intents, MessageEmbed, MessageManager, TextChannel } = require('discord.js');
const { createAudioPlayer } = require('@discordjs/voice');
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
const _play = require('./Classes/functions/play');
const { joinvoicechannel} = require('./executive');
const fs = require('fs');
const config = require('config');
const { seek } = require('./commands/seek');
//Creates the client
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES] });
const queue = new Map();
const DisconnectIdle = new Map();
DisconnectIdle.set(1, client);

// todo implement mySQL or MongoDB into Smoothy instead of plain JSON file
// const sequelize = new Sequelize('discord', 'root', 'aaron', {
//     host: 'localhost',
//     dialect: 'mysql',
//     logging: false,
// });

// const Tags = sequelize.define('server', {
// 	queue: {
//         type: Sequelize.STRING,
//     }
// });

var file = fs.readFileSync('./config/global.json');
var data = JSON.parse(file);

client.once('ready', async () => {
    if (data.queues[0]) {
        for (let i = 0;
            i < data.queues.length;
            i++) {
                const channel = await client.channels.fetch(data.queues[i].message.channelId);
                const message = await channel.messages.fetch(data.queues[i].message.id);
                const vc = await client.channels.fetch(data.queues[i].voiceChannel.id);
                data.queues[i].message = message;
                if (data.queues[i].nowPlaying) {
                    
                }
                data.queues[i].voiceChannel = vc;
                data.queues[i].currentsong[0].load = true;
                queue.set(data.queues[i].id, data.queues[i]);
            }
            if (data.disconnectIdles[0]) {
            for (let i = 0;
                i < data.disconnectIdles.length;
                i++) {
                    const channel = await client.channels.fetch(data.disconnectIdles[i].message.channelId);
                    const message = await channel.messages.fetch(data.disconnectIdles[i].message.id);
                    data.disconnectIdles[i].message = message;
                    data.disconnectIdles[i].client = client;
                    DisconnectIdle.set(data.disconnectIdles[i].id, data.disconnectIdles[i]);
                }
            for (let i = 0;
                i < data.disconnectIdles.length;
                i++) {
                    let id = data.queues[i].id;
                    let serverDisconnectIdle = DisconnectIdle.get(id);
                    let serverQueue = queue.get(id)
                    const vc = await joinvoicechannel(serverQueue.message, serverQueue.voiceChannel, DisconnectIdle,
                    serverDisconnectIdle, client, null);
                    serverQueue.player = createAudioPlayer();
                    serverQueue.subscription = vc.subscribe(serverQueue.player);
                    _play.default(serverQueue);
                }
        }
    
    }
    console.log('Smoothy 1.4.6 is online!');
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
    let file = fs.readFileSync('./config/prefixes.json');
    let data = JSON.parse(file);
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
                const exists = data[j].guildId === message.guildId;
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
        message.channel.send({embeds: [myprefixEmbed]});
        console.log(`Send current prefix ${prefix} to the channel`);
        return;
    }
    if(!message.content.startsWith(prefix)){
        return;
    }
    var serverDisconnectIdle = DisconnectIdle.get(message.guildId);
    var serverQueue = queue.get(message.guildId);
    var vc = message.member.voice.channel;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    console.log(`Command = ${command} ${args.join(' ')}`);
    //commands come in and checks if command ===, else the command was invalid
    if(command === 'ping'){
        ping(message, client);
    }else if (command === 'play' || command === 'p' || command === 'pp' || command === 'playp'){
        play(message, args,  vc, queue, DisconnectIdle, serverDisconnectIdle, serverQueue, command, client);
    }else if (command === 'queue' || command === 'list' || command === 'q'){
        queuelist(message, serverQueue, serverDisconnectIdle);
    }else if (command === 'skip' || command === 'next' || command === 's' || command === 'n'){
        skip(message, serverQueue, client);
    }else if (command === 'stop' || command === 'clear'){
        stop(message, serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
    }else if (command === 'leave' || command === 'disconnect' || command === 'dc' || command === 'die'){
        leave(message, queue, serverQueue, DisconnectIdle, serverDisconnectIdle);
    }else if (command === 'remove' || command === 'r'){
        remove(message, args, serverQueue, client);
    }else if (command === 'help'){
        help(message);
    }else if (command === 'pause' || command === 'pa'){
        pause(message, serverQueue, client);
    }else if (command === 'resume' || command === 'un'){
        resume(message,serverQueue, client);
    }else if (command === 'crash' || command === 'c'){
        snoopy_goes_wild.dummy = 'me';
    }else if (command === 'loop' || command === 'l'){
        loop(message, serverQueue, serverDisconnectIdle);
    }else if (command === 'loopsong' || command === 'ls'){
        loopsong(message, serverQueue, serverDisconnectIdle);
    }else if (command === 'repeat' || command === 'restart' || command === 're'){
        repeat(message, serverQueue, client);
    }else if (command === 'shuffle' || command === 'mix'){
        shuffle(message, serverQueue, client);
    }else if (command === 'jump' || command === 'j'){
        jump(message, args, serverQueue, serverDisconnectIdle);
    }else if (command === 'prefix' || command === 'changeprefix' || command === 'prefixchange'){
        changeprefix(message, args, serverQueue, data, found)
    }else if (command === 'volume' || command === 'v'){
        volume(message, args, serverQueue, serverDisconnectIdle)
    }else if (command === 'previous' || command === 'pr') {
        previous(message, serverQueue, serverDisconnectIdle);
    }else if (command === 'seek' || command === 'sk') {
        seek(message, args, serverQueue, serverDisconnectIdle);
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
module.exports = {DisconnectIdle, queue};
client.login(config.get('token'));    

