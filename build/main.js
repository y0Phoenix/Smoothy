"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// This is the Main File for Smoothy Developed by Eugene aka y0Phoenix 
// This is where the client is created and messages come in from discord and are converted into commands and args 
const discord_js_1 = require("discord.js");
const AbortController = require("node-abort-controller").AbortController;
const play_1 = require("./commands/play");
const leave_1 = require("./commands/leave");
const clear_1 = require("./commands/clear");
const skip_1 = require("./commands/skip");
const ping_1 = require("./commands/ping");
const queue_1 = require("./commands/queue");
const remove_1 = require("./commands/remove");
const help_1 = require("./commands/help");
const pause_1 = require("./commands/pause");
const resume_1 = require("./commands/resume");
const loop_1 = require("./commands/loop");
const loopsong_1 = require("./commands/loopsong");
const repeat_1 = require("./commands/repeat");
const shuffle_1 = require("./commands/shuffle");
const jump_1 = require("./commands/jump");
const change_prefix_1 = require("./commands/change prefix");
const volume_1 = require("./commands/volume");
const previous_1 = require("./commands/previous");
const executive_1 = require("./executive");
const fs = require("fs");
const config = require("config");
const seek_1 = require("./commands/seek");
const disconnectIdle_1 = require("./Classes/functions/disconnectIdle");
const Queue_1 = require("./Classes/Queue");
const maps_1 = require("./maps");
//Creates the client
const client = new discord_js_1.Client({ intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_VOICE_STATES, discord_js_1.Intents.FLAGS.GUILD_MESSAGES] });
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
    const maps = (0, maps_1.default)();
    const { DisconnectIdle, queue } = maps;
    DisconnectIdle.set(1, client);
    if (data.queues[0]) {
        if (data.disconnectIdles[0]) {
            for (let i = 0; i < data.disconnectIdles.length; i++) {
                const dci = data.disconnectIdles[i];
                const channel = await client.channels.fetch(dci.message.channelId);
                const message = await channel.messages.fetch(dci.message.id);
                dci.message = message;
                dci.client = client;
                dci.disconnectTimervcidle = disconnectIdle_1.disconnectTimervcidle;
                dci.disconnectvcidle = disconnectIdle_1.disconnectvcidle;
                console.log(`set dci functions for`);
                DisconnectIdle.set(dci.id, dci);
            }
        }
        for (let i = 0; i < data.queues.length; i++) {
            const channel = await client.channels.fetch(data.queues[i].message.channelId);
            const message = await channel.messages.fetch(data.queues[i].message.id);
            const vc = await client.channels.fetch(data.queues[i].voiceChannel.id);
            data.queues[i].message = message;
            data.queues[i].voiceChannel = vc;
            data.queues[i].currentsong[0].load = true;
            let serverQueue = new Queue_1.default({ msg: data.queues[i].message, songs: data.queues[i].songs,
                shuffledSongs: data.queues[i].shuffledSongs, currentsong: data.queues[i].currentsong });
            serverQueue.shuffle = data.queues[i].shuffle;
            serverQueue.loop = data.queues[i].loop;
            serverQueue.loopsong = data.queues[i].loopsong;
            queue.set(data.queues[i].id, serverQueue);
        }
        for (let i = 0; i < data.disconnectIdles.length; i++) {
            let id = data.queues[i].id;
            let serverDisconnectIdle = DisconnectIdle.get(id);
            let serverQueue = queue.get(id);
            await (0, executive_1.joinvoicechannel)(serverQueue.message, serverQueue.voiceChannel, DisconnectIdle, serverDisconnectIdle, client, null);
            serverQueue.play();
        }
    }
    console.log('Smoothy 1.4.6 is online!');
    client.user.setActivity('-help', { type: 'LISTENING' });
});
client.once('recconnecting', () => {
    console.log('Smoothy is reconnecting!');
});
client.once('disconnect', () => {
    console.log('Disconnected!');
});
//creates a message from discord with all the info about the user, server, voicechannel and text channel
client.on('messageCreate', message => {
    const maps = (0, maps_1.default)();
    const { DisconnectIdle, queue } = maps;
    if (message.author.bot) {
        return;
    }
    let file = fs.readFileSync('./config/prefixes.json', 'utf-8');
    let data = JSON.parse(file);
    let prefix = undefined;
    let found = 0;
    for (let j = 0; prefix === undefined; j++) {
        if (data.length === j) {
            prefix = data[0].prefix;
            found = 0;
        }
        else {
            const exists = data[j].guildId === message.guildId;
            if (exists) {
                prefix = data[j].prefix;
                found = j;
                break;
            }
        }
    }
    if (message.content === 'myprefix') {
        const myprefixEmbed = new discord_js_1.MessageEmbed()
            .setColor('BLUE')
            .addFields({
            name: ':thumbsup: Current Prefix', value: `**${prefix}**`
        });
        message.channel.send({ embeds: [myprefixEmbed] });
        console.log(`Send current prefix ${prefix} to the channel`);
        return;
    }
    if (!message.content.startsWith(prefix)) {
        return;
    }
    var serverDisconnectIdle = DisconnectIdle.get(message.guildId);
    var serverQueue = queue.get(message.guildId);
    var vc = message.member.voice.channel;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    console.log(`Command = ${command} ${args.join(' ')}`);
    //commands come in and checks if command ===, else the command was invalid
    if (command === 'ping') {
        (0, ping_1.default)(message, client);
    }
    else if (command === 'play' || command === 'p' || command === 'pp' || command === 'playp') {
        (0, play_1.default)(message, args, vc, queue, DisconnectIdle, serverDisconnectIdle, serverQueue, command, client);
    }
    else if (command === 'queue' || command === 'list' || command === 'q') {
        (0, queue_1.default)(message, serverQueue, serverDisconnectIdle);
    }
    else if (command === 'skip' || command === 'next' || command === 's' || command === 'n') {
        (0, skip_1.default)(message, serverQueue, client);
    }
    else if (command === 'stop' || command === 'clear') {
        (0, clear_1.default)(message, serverQueue, queue, serverDisconnectIdle);
    }
    else if (command === 'leave' || command === 'disconnect' || command === 'dc' || command === 'die') {
        (0, leave_1.default)(message, queue, serverQueue, DisconnectIdle, serverDisconnectIdle);
    }
    else if (command === 'remove' || command === 'r') {
        (0, remove_1.default)(message, args, serverQueue, client);
    }
    else if (command === 'help') {
        (0, help_1.default)(message);
    }
    else if (command === 'pause' || command === 'pa') {
        (0, pause_1.default)(message, serverQueue, client);
    }
    else if (command === 'resume' || command === 'un') {
        (0, resume_1.default)(message, serverQueue, client);
    }
    else if (command === 'crash' || command === 'c') {
        throw new Error('Killed from command on Discord');
    }
    else if (command === 'loop' || command === 'l') {
        (0, loop_1.default)(message, serverQueue, serverDisconnectIdle);
    }
    else if (command === 'loopsong' || command === 'ls') {
        (0, loopsong_1.default)(message, serverQueue, serverDisconnectIdle);
    }
    else if (command === 'repeat' || command === 'restart' || command === 're') {
        (0, repeat_1.default)(message, serverQueue, client);
    }
    else if (command === 'shuffle' || command === 'mix') {
        (0, shuffle_1.default)(message, serverQueue, client);
    }
    else if (command === 'jump' || command === 'j') {
        (0, jump_1.default)(message, args, serverQueue, serverDisconnectIdle);
    }
    else if (command === 'prefix' || command === 'changeprefix' || command === 'prefixchange') {
        (0, change_prefix_1.default)(message, args, data, found, client);
    }
    else if (command === 'volume' || command === 'v') {
        (0, volume_1.default)(message, args, serverQueue, serverDisconnectIdle);
    }
    else if (command === 'previous' || command === 'pr') {
        (0, previous_1.default)(message, serverQueue, serverDisconnectIdle);
    }
    else if (command === 'seek' || command === 'sk') {
        (0, seek_1.default)(message, args, serverQueue, serverDisconnectIdle);
    }
    else if (command === 'nowplaying' || command === 'np') {
        if (serverQueue) {
            serverQueue.nowPlayingSend();
        }
    }
    else {
        const invalidCommandEmbed = new discord_js_1.MessageEmbed()
            .setColor(`RED`)
            .setDescription(`:rofl: Invalid Command Type -help To See Current Commands`);
        message.channel.send({ embeds: [invalidCommandEmbed] })
            .then(msg => {
            setTimeout(() => {
                msg.delete();
            }, 30000);
        });
        return;
    }
});
client.login(config.get('token'));
