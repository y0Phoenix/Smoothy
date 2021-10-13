const { Client, Intents,} = require('discord.js');
const prefix = '-';
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES] });
// ​const connections = new Map();
// ​const audioManager = new AudioManager();
// ​
client.once('ready', () => console.log(`${client.user.username} is online!`));
​
// client.on('messageCreate', message => {
//     if(message.author.bot || message.channel.type === `DM`) return;
    
//     if(!message.content.startsWith(prefix)) return;
    
//     let args = message.content.substring(prefix.length).split(" ");
    
//     const vc = connections.get(message.guild.me.voice.channel?.id);
    
//     switch(args[0].toLowerCase()){
//         case 'play':
//             if(!message.member.voice.channel && !message.guild.me.voice.channel) return message.channel.send({content: `Please join a voice channel in order to play a song!`});
//             if(!args[1]) return message.channel.send({content: `Please provide a song`});
//             const uvc = message.member.voice.channel || message.guild.me.voice.channel;
//             audioManager.play(uvc, args[1], {
//                 quality: 'high',
//                 audiotype: 'arbitrary',
//                 volume: 10
//             }).then(queue => {
//                 connections.set(uvc.id, uvc);
//                 if(queue === false) message.channel.send({content: `Your song is now playing!`});
//                 else message.channel.send({content: `Your song has been added to the queue!`});
//             }).catch(err => {
//                 console.log(err);
//                 message.channel.send({content: `There was an error while trying to connect to the voice channel!`});
//             });
//             break;
//         case 'skip':
//             if(!vc) return message.channel.send({content: `There is currently nothing playing!`});
//             audioManager.skip(vc).then(() => message.channel.send({content: `Successfully skipped the song!`})).catch(err => {
//                 console.log(err);
//                 message.channel.send({content: `There was an error while skipping the song!`});
//             });
//             break;
//         case 'stop':
//             if(!vc) return message.channel.send({content: `There is currently nothing playing!`});
//             audioManager.stop(vc);
//             message.channel.send({content: `Player successfully stopped!`});            
//             break;
//         case 'queue':
//             if(!vc) return message.channel.send({content: `There is currently nothing playing!`});
//             const queue = audioManager.queue(vc).reduce((text, song, index) => {
//                 if(song.title) text += `**[${index + 1}]** ${song.title}`;
//                 else text += `**[${index + 1}]** ${song.url}`;
//                 return text;
//             }, `__**QUEUE**__`);
//             const queueEmbed = new discord.MessageEmbed()
//             .setColor(`BLURPLE`)
//             .setTitle(`Queue`)
//             .setDescription(queue);
//             message.channel.send({embeds: [queueEmbed]});
//             break;
//         case 'volume':
//             if(!vc) return message.channel.send({content: `There is currently nothing playing!`});
//             if(!args[1]) return message.channel.send({content: `Please provide the volume`});
//             if(Number(args[1] < 1 || Number(args[1]) > 10)) return message.channel.send({content: `Please provide a volume between 1-10`});
//             audioManager.volume(vc, Number(args[1]));
//             break;
//     }
//});
​
client.login('ODg3ODY5MjQzMjE4MDg3OTU2.YUKaqw.b70z4bJ2dclica2mbtMI0y2ZuUM');
