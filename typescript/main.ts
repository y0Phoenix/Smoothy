// This is the Main File for Smoothy Developed by Eugene aka y0Phoenix 
// This is where the client is created and messages come in from discord and are converted into commands and args 
import { Client, Intents, MessageEmbed} from 'discord.js';
const AbortController = require ("node-abort-controller").AbortController;
import Play from './commands/play';
import leave from './commands/leave';
import clear from './commands/clear';
import skip from './commands/skip';
import ping from './commands/ping';
import queuelist from './commands/queue';
import remove from './commands/remove';
import help from './commands/help';
import pause from './commands/pause';
import resume from './commands/resume';
import loop from './commands/loop';
import loopsong from './commands/loopsong';
import repeat from './commands/repeat';
import shuffle from './commands/shuffle';
import jump from './commands/jump';
import changeprefix from './commands/change prefix'
import volume from './commands/volume';
import previous  from './commands/previous';
import _play from './Classes/functions/play';
import { joinvoicechannel} from './executive';
import * as fs from 'fs';
import * as config from 'config';
import seek from './commands/seek';
import { disconnectTimervcidle, disconnectvcidle } from './Classes/functions/disconnectIdle';
import { Idle, WriteIdle } from "./Classes/Idle";
import Queue from "./Classes/Queue";
import getMaps from "./maps";
//Creates the client
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES] });

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

var file = fs.readFileSync('./config/global.json', 'utf-8');
var data = JSON.parse(file);

client.once('ready', async () => {
    const maps = getMaps();
    const {DisconnectIdle, queue} = maps;
    DisconnectIdle.set(1, client);
    if (data.queues[0]) {
        if (data.disconnectIdles[0]) {
        for (let i = 0;
            i < data.disconnectIdles.length;
            i++) {
                const dci: WriteIdle = data.disconnectIdles[i];
                const channel: any = await client.channels.fetch(dci.message.channelId);
                const message = await channel.messages.fetch(dci.message.id);
                dci.message = message;
                dci.client = client;
                dci.disconnectTimervcidle = disconnectTimervcidle;
                dci.disconnectvcidle = disconnectvcidle;
                console.log(`set dci functions for`);
                DisconnectIdle.set(dci.id, dci);
            }
        }
        for (let i = 0;
            i < data.queues.length;
            i++) {
                const channel: any = await client.channels.fetch(data.queues[i].message.channelId);
                const message = await channel.messages.fetch(data.queues[i].message.id);
                const vc = await client.channels.fetch(data.queues[i].voiceChannel.id);
                data.queues[i].message = message;
                data.queues[i].voiceChannel = vc;
                data.queues[i].currentsong[0].load = true;
                let serverQueue = new Queue({ msg: data.queues[i].message, songs: data.queues[i].songs, 
                    shuffledSongs: data.queues[i].shuffledSongs, currentsong: data.queues[i].currentsong });
                serverQueue.shuffle = data.queues[i].shuffle;
                serverQueue.loop = data.queues[i].loop;
                serverQueue.loopsong = data.queues[i].loopsong;
                queue.set(data.queues[i].id, serverQueue);
                }
        for (let i = 0;
            i < data.disconnectIdles.length;
            i++) {
                let id = data.queues[i].id;
                let serverDisconnectIdle: Idle = DisconnectIdle.get(id);
                let serverQueue: Queue = queue.get(id);
                await joinvoicechannel(serverQueue.message, serverQueue.voiceChannel, DisconnectIdle,
                serverDisconnectIdle, client, null);
                serverQueue.play();
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
    const maps = getMaps();
    const {DisconnectIdle, queue} = maps;
    if(message.author.bot){
        return;
    }
    let file = fs.readFileSync('./config/prefixes.json', 'utf-8');
    let data = JSON.parse(file);
    let prefix = undefined;
    let found = 0;
    for(let j = 0;
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
    var serverDisconnectIdle: Idle = DisconnectIdle.get(message.guildId);
    var serverQueue: Queue = queue.get(message.guildId);
    var vc = message.member.voice.channel;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    console.log(`Command = ${command} ${args.join(' ')}`);
    //commands come in and checks if command ===, else the command was invalid
    if(command === 'ping'){
        ping(message, client);
    }else if (command === 'play' || command === 'p' || command === 'pp' || command === 'playp'){
        Play(message, args,  vc, queue, DisconnectIdle, serverDisconnectIdle, serverQueue, command, client);
    }else if (command === 'queue' || command === 'list' || command === 'q'){
        queuelist(message, serverQueue, serverDisconnectIdle);
    }else if (command === 'skip' || command === 'next' || command === 's' || command === 'n'){
        skip(message, serverQueue, client);
    }else if (command === 'stop' || command === 'clear'){
        clear(message, serverQueue, queue, serverDisconnectIdle);
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
        throw new Error('Killed from command on Discord');
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
        changeprefix(message, args, data, found, client)
    }else if (command === 'volume' || command === 'v'){
        volume(message, args, serverQueue, serverDisconnectIdle)
    }else if (command === 'previous' || command === 'pr') {
        previous(message, serverQueue, serverDisconnectIdle);
    }else if (command === 'seek' || command === 'sk') {
        seek(message, args, serverQueue, serverDisconnectIdle);
    }else if (command === 'nowplaying' || command === 'np') {
        if (serverQueue) {
            serverQueue.nowPlayingSend();
        }
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
client.login(config.get('token'));    

