"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const audioPlayerIdle_1 = require("./functions/audioPlayerIdle");
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const retryPlayer_1 = require("./functions/retryPlayer");
const modules_1 = require("../modules/modules");
const findSplice_1 = require("./functions/findSplice");
const loopNextSong_1 = require("./functions/loopNextSong");
const playNext_1 = require("./functions/playNext");
const nowPlayingSend_1 = require("./functions/nowPlayingSend");
const executive_1 = require("../executive");
const maps_1 = require("../maps");
const play_1 = require("./functions/play");
const getVideo_1 = require("./functions/getVideo");
class Queue {
    constructor(data) {
        this.voiceChannel = null;
        this.songs = [];
        this.shuffledSongs = [];
        this.currentsong = [];
        this.stop = false;
        this.jump = 0;
        this.tries = 0;
        this.audioPlayerErr = false;
        this.player = null;
        this.resource = null;
        this.subsciption = null;
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
        let { msg, songs, shuffledSongs, currentsong, previous } = data;
        const { DisconnectIdle } = (0, maps_1.default)();
        if (songs) {
            if (songs[0]) {
                this.songs = [...songs];
                this.currentsong.push(currentsong[0]);
                if (previous[0]) {
                    this.previous.push(previous[0]);
                }
            }
        }
        if (shuffledSongs) {
            if (shuffledSongs[0]) {
                this.shuffledSongs = [...shuffledSongs];
            }
        }
        this.message = msg;
        this.id = msg.guild.id;
        this.voiceChannel = msg.member.voice.channel;
        this.player = (0, voice_1.createAudioPlayer)();
        this.voiceConnection = (0, voice_1.getVoiceConnection)(msg.guild.id);
        if (!this.voiceConnection) {
            const join = async () => {
                const temp = (0, maps_1.default)();
                const bool = await (0, modules_1.exists)(this.id, 'dci');
                this.voiceConnection = await (0, executive_1.joinvoicechannel)(this.message, this.voiceChannel, temp.DisconnectIdle, DisconnectIdle.get(this.id), DisconnectIdle.get(1), bool);
                this.subsciption = this.voiceConnection.subscribe(this.player);
            };
            join();
        }
        else {
            this.subsciption = this.voiceConnection.subscribe(this.player);
        }
        this.player.on('error', async (err) => {
            const localServerQueue = this;
            localServerQueue.audioPlayerErr = true;
            console.log(`Audio Player Threw An Err`);
            setTimeout(async () => {
                if (localServerQueue.tries < 5) {
                    localServerQueue.player.stop();
                    await this.retryTimer();
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
                    this.audioPlayerIdle();
                }
            }, 1500);
        });
        //when the audioPlayer for this construct inside serverQueue is Idle the function is executed
        this.player.on(voice_1.AudioPlayerStatus.Idle, async (playerEvent) => {
            this.audioPlayerIdle();
        });
        this.player.on(voice_1.AudioPlayerStatus.Playing, async (data) => {
            const localServerQueue = this;
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
                        .addField(`Requested By`, `<@${localServerQueue.currentsong[0].message.author.id}>`)
                        .setThumbnail(`${localServerQueue.currentsong[0].thumbnail}`)
                        .setTimestamp();
                    localServerQueue.nowPlaying = await localServerQueue.message.channel.send({ embeds: [playembed] });
                    localServerQueue.messagesent = true;
                    (0, modules_1.writeGlobal)('update queue', localServerQueue, localServerQueue.id);
                }
            }
        });
        this.findSplice = findSplice_1.default;
        this.loopNextSong = loopNextSong_1.default;
        this.playNext = playNext_1.default;
        this.audioPlayerIdle = audioPlayerIdle_1.default;
        this.play = play_1.default;
        this.getVideo = getVideo_1.default;
        this.retryTimer = retryPlayer_1.retryTimer;
        this.nowPlayingSend = nowPlayingSend_1.default;
    }
}
exports.default = Queue;
