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
    message;
    id;
    voiceChannel = null;
    voiceConnection;
    songs = [];
    shuffledSongs = [];
    currentsong = [];
    stop = false;
    jump = 0;
    tries = 0;
    audioPlayerErr = false;
    player = null;
    resource = null;
    subsciption = null;
    previous = [];
    previousbool = false;
    messagesent = false;
    nowPlaying = null;
    nowPlayingTimer = null;
    shuffle = false;
    loop = false;
    loopsong = false;
    repeat = false;
    bool = false;
    jumpbool = false;
    queue;
    nowPlayingSend = nowPlayingSend_1.default;
    playNext = playNext_1.default;
    findSplice = findSplice_1.default;
    loopNextSong = loopNextSong_1.default;
    audioPlayerIdle = audioPlayerIdle_1.default;
    play = play_1.default;
    getVideo = getVideo_1.default;
    retryTimer = retryPlayer_1.retryTimer;
    checkIfPlaying = retryPlayer_1.checkIfPlaying;
    constructor(data) {
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
                const maps = (0, maps_1.default)();
                const bool = await (0, modules_1.exists)(this.id, 'dci');
                this.voiceConnection = await (0, executive_1.joinvoicechannel)(this.message, this.voiceChannel, maps.DisconnectIdle, DisconnectIdle.get(this.id), DisconnectIdle.get(1), bool);
                this.subsciption = this.voiceConnection.subscribe(this.player);
            };
            join();
        }
        else {
            this.subsciption = this.voiceConnection.subscribe(this.player);
        }
        this.player.on('error', async () => {
            const localServerQueue = this;
            localServerQueue.audioPlayerErr = true;
            console.log(`Audio Player Threw An Err`);
            setTimeout(async () => {
                if (localServerQueue.tries < 5) {
                    localServerQueue.player.stop();
                    await this.retryTimer();
                    localServerQueue.tries++;
                    const playing = this.checkIfPlaying;
                    if (playing) {
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
        //when the audioPlayer for this class inside is Idle the function is executed
        this.player.on(voice_1.AudioPlayerStatus.Idle, async () => {
            this.audioPlayerIdle();
        });
        // this is meant for when the player throws an error and the error is corrected, its needed to send a nowplaying message   
        this.player.on(voice_1.AudioPlayerStatus.Playing, async () => {
            const localServerQueue = this;
            if (localServerQueue.audioPlayerErr === true && localServerQueue.tries > 0) {
                console.log('Retries Successfull');
                localServerQueue.audioPlayerErr = false;
                localServerQueue.tries = 0;
                if (localServerQueue.loopsong === false && localServerQueue.audioPlayerErr === false && localServerQueue.messagesent === false) {
                    localServerQueue.nowPlaying = await this.nowPlayingSend();
                    localServerQueue.messagesent = true;
                    (0, modules_1.writeGlobal)('update queue', localServerQueue, localServerQueue.id);
                }
            }
        });
    }
}
exports.default = Queue;
