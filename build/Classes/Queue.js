"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const audioPlayerIdle_1 = require("./functions/audioPlayerIdle");
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const retryPlayer_1 = require("./functions/retryPlayer");
const modules_1 = require("../modules/modules");
class Queue {
    constructor(data) {
        this.songs = [];
        this.shuffledSongs = [];
        this.currentsong = [];
        this.jump = 0;
        this.tries = 0;
        this.audioPlayerErr = false;
        this.previous = [];
        this.previousbool = false;
        this.messagesent = false;
        this.nowPlaying = null;
        this.nowPlayingTimer = null;
        this.shuffle = false;
        this.loop = false;
        this.loopsong = false;
        this.repeat = false;
        this.bool = false;
        this.jumpbool = false;
        const { queue, DisconnectIdle, serverDisconnectIdle, msg } = data;
        this.message = msg;
        this.id = msg.guild.id;
        this.voiceChannel = msg.member.voice.channel;
        this.player = (0, voice_1.createAudioPlayer)();
        this.voiceConnection = (0, voice_1.getVoiceConnection)(msg.guild.id);
        this.subsciption = this.voiceConnection.subscribe(this.player);
        this.player.on('error', async (err) => {
            const localServerQueue = err.resource.metadata;
            localServerQueue.audioPlayerErr = true;
            console.log(`Audio Player Threw An Err`);
            setTimeout(async () => {
                if (localServerQueue.tries < 5) {
                    localServerQueue.player.stop();
                    await (0, retryPlayer_1.retryTimer)(localServerQueue, queue, DisconnectIdle, serverDisconnectIdle);
                    localServerQueue.tries++;
                    const playing = await (0, retryPlayer_1.checkIfPlaying)(localServerQueue);
                    if (playing === true) {
                        localServerQueue.tries = 0;
                        localServerQueue.audioPlayerErr = false;
                        console.log('Retries Sucessfull');
                    }
                }
                else if (localServerQueue.tries === 5) {
                    localServerQueue.tries = 0;
                    localServerQueue.audioPlayerErr = false;
                    console.log(`Retries Failed Sending Error Message`);
                    const audioPlayerErrME = new discord_js_1.MessageEmbed()
                        .setColor('RED')
                        .setTitle(`AudioPlayerError: ${localServerQueue.songs[0].title} Threw An Error :pensive:`)
                        .setURL(`${localServerQueue.songs[0].url}`)
                        .setDescription(`Please Screenshot this message along with any other relevent info, 
                          and DM it to **Eugene#3399** if you have a GitHub Profile I would appreciate a comment on
                          the AudioPlayerError issue at [Smoothies Repo](https://github.com/y0Phoenix/Smoothy/issues/1).`)
                        .setThumbnail(`https://github.com/y0Phoenix/Smoothy/blob/main/Smoothy%20Logo.png?raw=true`)
                        .setImage(`${localServerQueue.songs[0].thumbnail}`)
                        .setTimestamp();
                    localServerQueue.message.channel.send({ embeds: [audioPlayerErrME] });
                    localServerQueue.player.stop();
                    (0, audioPlayerIdle_1.default)(localServerQueue, queue, DisconnectIdle, serverDisconnectIdle);
                }
            }, 1500);
        });
        //when the audioPlayer for this construct inside serverQueue is Idle the function is executed
        this.player.on(voice_1.AudioPlayerStatus.Idle, async (playerEvent) => {
            //resource.metadata is set inside of the async play function
            const localServerQueue = playerEvent.resource.metadata;
            (0, audioPlayerIdle_1.default)(localServerQueue, queue, DisconnectIdle, serverDisconnectIdle);
        });
        this.player.on(voice_1.AudioPlayerStatus.Playing, async (data) => {
            const localServerQueue = data.resource.metadata;
            if (localServerQueue.audioPlayerErr === true &&
                localServerQueue.tries > 0) {
                console.log('Retries Successfull');
                localServerQueue.audioPlayerErr = false;
                localServerQueue.tries = 0;
                if (localServerQueue.loopsong === false &&
                    localServerQueue.audioPlayerErr === false &&
                    localServerQueue.messagesent === false) {
                    const playembed = new discord_js_1.MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(`:thumbsup: Now Playing`)
                        .setDescription(`:musical_note: ***[${localServerQueue.currentsong[0].title}](${localServerQueue.currentsong[0].url})*** :musical_note:`)
                        .addField(`Requested By`, `<@${localServerQueue.currentsong[0].message.author.id ? localServerQueue.currentsong[0].message.author.id : localServerQueue.currentsong[0].message.authorId}>`)
                        .setThumbnail(`${localServerQueue.currentsong[0].thumbnail}`)
                        .setTimestamp();
                    localServerQueue.nowPlaying = await localServerQueue.message.channel.send({ embeds: [playembed] });
                    localServerQueue.messagesent = true;
                    (0, modules_1.writeGlobal)('update queue', localServerQueue, localServerQueue.id);
                }
            }
        });
    }
}
exports.default = Queue;
