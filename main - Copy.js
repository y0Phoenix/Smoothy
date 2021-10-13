const {Connection} = require('discordaudio')
const discordaudio = require('discordaudio');
const { Client, Intents,} = require('discord.js');
const ytSearch = require('yt-search')
const prefix = '-';
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES] });
const audioManager = new discordaudio.AudioManager();

client.once('ready', () =>{
    console.log('Smoothy Is Online')
});
client.once('recconnecting', () => {
    console.log('Smoothy is reconnecting!');
});
client.once('disconnect', () => {
    console.log('Disconnected!');
});
client.on('messageCreate', message => {
    if(!message.content.startsWith(prefix) || message.author.bot){
        console.log('Message author was bot!');
        return;
    } 
    
    if(!message.content.startsWith(prefix)) return;
    
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    
    var vc = message.member.voice.channel

    
    function joinvoicechannel(){
        voiceConnection = new Connection(vc,{
            selfDeaf: 'true',
            selfMute: 'false'
        });
    }
    
    function play(video){
        // const stream = ytdl(execvars.video.url, { filter: 'audioonly' });
        audioManager.play(vc, video.url,{
            volume: '1',
            quality: 'high',
            audiotype: 'arbitrary'
        }).then(queue => {
            if(queue === false){
                console.log('Playing the song immedietly')
                message.reply(`Playing ***${video.title}***`)
            }
            else{
                console.log(`${video.title} has been added to the queue`)
                message.reply(`${video.title} has been added to the queue`)
            } 
        })
    }
    async function findvideo(){
        var videoName = args.join(' ');
        const videoFinder = async (query) => {
            const videoResult = await ytSearch(query);

            return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;

        }

        var video = await videoFinder(videoName);

        if (video) {
            console.log("Found video " + video.title);
            play(video);
                
        } else {
            message.channel.send(':rofl: No ***video*** results found :rofl:');
            return;
        }
    }
    switch(command){
        case 'play', 'p':
            try{
                if (args.length === 0) return message.reply(':nerd: You need to specify with either a ***link*** or search query :nerd:');
                if (!vc) return message.reply(':nerd: You need to be in a ***voice channel*** to execute this command :nerd:');
                const permissions = vc.permissionsFor(message.client.user);
                if (!permissions.has('CONNECT')) return message.reply(':nerd: You dont have the correct ***permissins*** :nerd:');
                if (!permissions.has('SPEAK')) return message.reply(':nerd: You dont have the correct ***permissins*** :nerd:');
                const uvc = message.member.voice.channel || message.guild.me.voice.channel;
                joinvoicechannel();
                findvideo();
                }catch(error) {
                    console.error(error);
            }break;
        case 'skip':
            vc = message.member.voice.channel
            if(!vc) return message.channel.send({content: `There is currently nothing playing!`});
            audioManager.skip(vc).then(() => message.channel.send({content: `Successfully skipped the song!`})).catch(err => {
                console.log(err);
                message.channel.send({content: `There was an error while skipping the song!`});
            });
            break;
        case 'stop':
            if(!vc) return message.channel.send({content: `There is currently nothing playing!`});
            audioManager.stop(vc);
            message.channel.send({content: `Player successfully stopped!`});            
            break;
        case 'queue':
            if(!vc) return message.channel.send({content: `There is currently nothing playing!`});
            const queue = audioManager.queue(vc).reduce((text, song, index) => {
                if(song.title) text += `**[${index + 1}]** ${song.title}`;
                else text += `**[${index + 1}]** ${song.url}`;
                return text;
            }, `__**QUEUE**__`);
            const queueEmbed = new discord.MessageEmbed()
            .setColor(`BLURPLE`)
            .setTitle(`Queue`)
            .setDescription(queue);
            message.channel.send({embeds: [queueEmbed]});
            break;
        case 'volume':
            if(!vc) return message.channel.send({content: `There is currently nothing playing!`});
            if(!args[1]) return message.channel.send({content: `Please provide the volume`});
            if(Number(args[1] < 1 || Number(args[1]) > 10)) return message.channel.send({content: `Please provide a volume between 1-10`});
            audioManager.volume(vc, Number(args[1]));
            break;
    }
});
client.login('ODg3ODY5MjQzMjE4MDg3OTU2.YUKaqw.b70z4bJ2dclica2mbtMI0y2ZuUM')   
