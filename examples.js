//non used code just an ideas file

var profile = [];

function play(video, message, audioPlayer) {
    const stream = ytdl(video.url, { filter: 'audioonly' });
    const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
    audioPlayer.play(resource);
    console.log("Playing " + video.title + "!");
    currenttitle = video.title;
    message.reply(`:thumbsup: :musical_note: Now Playing ***${currenttitle}*** :musical_note:`);
}

function playIt(message) {
    var profile = pullProfile(message);

    // find video
    var videoName = args.join(' ');

    // find video and queue to play
    const videoFinder = async (query) => {
        const videoResult = await ytSearch(query);

        return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;

    }

    var video = await videoFinder(videoName);
    
    // add video to execvars.musicQueue
    if (profile.audioPlayer.state.status === AudioPlayerStatus.Idle) {
        profile.subscription = profile.voiceConnection.subscribe(profile.audioPlayer);
        play(video, message, profile.audioPlayer);
        console.log('subscribed to audioPlayer');
    } else {
        profile.musicQueue.push({ 'videoName': videoName, 'video': video });
        message.reply(`:thumbsup: ***${video.title}*** has been added to the queue :arrow_down:`);
        console.log(video.title + " has been added to the queue!");
    }

}

function pullProfile(message) {

    var voiceChannel = message.member.voice.channel;

    // if voice channel already exist then ... 
    var profile = lookupProfile(voiceChannel);
    if (profile !== undefined) {
        // add to queue
        // send message
        return profile;
    }

    if (args.length === 0) return message.reply(':nerd: You need to specify with either a ***link*** or search query :nerd:');
    if (!voiceChannel) return message.reply(':nerd: You need to be in a ***voice channel*** to execute this command :nerd:');
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT')) return message.reply(':nerd: You dont have the correct ***permissins*** :nerd:');
    if (!permissions.has('SPEAK')) return message.reply(':nerd: You dont have the correct ***permissins*** :nerd:');
   
    var voiceConnection = undefined;
    if (VoiceConnectionStatus.Disconnected) 
        voiceConnection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator
        });

    var audioPlayer = createAudioPlayer();
    audioPlayer.on(AudioPlayerStatus.Idle, () => {
        console.log("audioPlayer.on(AudioPlayerStatus.Idle called...");
        playNext(execvars.musicQueue, message);
        
    });

   

    // add a voice channel profile
    profile = {
        id: getId(voiceChannel),
        voiceConnection: voiceConnection,
        audioPlayer: audioPlayer,
        subscription: subscription,
        musicQueue: []
    };
    audioPlayerProfile.push(profile);

    return profile;
}

function getId(voiceChannel) {
    return voiceChannel.guild.id + "." + voiceChannel.id;
}

function lookupProfile(voiceChannel) {
    // loop through autioPlayerProfile array and find match for voiceChannelId

    var i = 0;
    while (i++ < audioPlayerProfile.length) {
        if (audioPlayerProfile[i].voiceChannelId === getId(voiceChannel)) {
            return audioPlayerProfile[i];
        }
    }

    return undefined;
}