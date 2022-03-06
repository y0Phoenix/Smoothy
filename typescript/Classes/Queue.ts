import { Message } from 'discord.js';
import audioPlayerIdle from './functions/audioPlayerIdle';
import {
  AudioPlayerStatus,
  StreamType,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnectionStatus,
  AudioPlayer, 
  PlayerSubscription, 
  VoiceConnection,
  AudioResource
} from '@discordjs/voice';
import { MessageEmbed } from'discord.js';
import {Song} from './Song';
import { retryTimer, checkIfPlaying } from './functions/retryPlayer';
import { exists, writeGlobal } from '../modules/modules';
import findSplice from './functions/findSplice';
import loopNextSong from './functions/loopNextSong';
import playNext from './functions/playNext';
import nowPlayingSend from './functions/nowPlayingSend';
import { joinvoicechannel } from '../executive';
import getMaps from '../maps';
import play from './functions/play';
import getVideo from './functions/getVideo';
import { Idle } from './Idle';


export default class Queue {
    message: Partial<Message>;
    id : string;
    voiceChannel: any = null;
    voiceConnection: VoiceConnection;
    songs: Partial<Song>[] = [];
    shuffledSongs: Partial<Song>[] = [];
    currentsong: Partial<Song>[] = [];
    stop: boolean = false;
    jump: number = 0;
    tries: number = 0;
    audioPlayerErr: boolean = false;
    player: AudioPlayer = null;
    resource: AudioResource = null;
    subsciption: PlayerSubscription = null;
    previous: Partial<Song>[] = [];
    previousbool: boolean = false;
    messagesent: boolean = false;
    nowPlaying: Message = null;
    nowPlayingTimer: any = null;
    shuffle: boolean = false;
    loop: boolean = false;
    loopsong: boolean = false;
    repeat: boolean = false;
    bool: boolean = false;
    jumpbool: boolean = false;
    nowPlayingSend: typeof nowPlayingSend = nowPlayingSend;
    playNext: typeof playNext = playNext;
    findSplice: typeof findSplice = findSplice;
    loopNextSong: typeof loopNextSong = loopNextSong;
    audioPlayerIdle: typeof audioPlayerIdle = audioPlayerIdle;
    play: typeof play = play;
    getVideo: typeof getVideo = getVideo;
    retryTimer: typeof retryTimer = retryTimer;
    checkIfPlaying: typeof checkIfPlaying = checkIfPlaying
    
    constructor(data: any) {
        let {msg, songs, shuffledSongs, currentsong, previous} = data;
        const {DisconnectIdle} = getMaps();
        if (songs){
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
        this.player = createAudioPlayer();
        this.voiceConnection = getVoiceConnection(msg.guild.id);
        if (!this.voiceConnection) {
            const join = async () => {
                const maps = getMaps();
                const bool = await exists(this.id, 'dci')
                this.voiceConnection = await joinvoicechannel(this.message, this.voiceChannel, maps.DisconnectIdle, DisconnectIdle.get(this.id), DisconnectIdle.get(1), bool);
                this.subsciption = this.voiceConnection.subscribe(this.player);
            };
            join();
        }
        else {
            this.subsciption = this.voiceConnection.subscribe(this.player);
        }

        this.player.on('error', async () => {
            const localServerQueue: Queue = this;
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
          } else if (localServerQueue.tries === 5) {
              localServerQueue.tries = 0;
              localServerQueue.audioPlayerErr = false;
              console.log(`Retries Failed Sending Error Message`);
              const audioPlayerErrME = new MessageEmbed()
              .setColor('RED')
              .setTitle(
                  `AudioPlayerError: ${localServerQueue.songs[0].title} Threw An Error :pensive:`
              )
              .setURL(`${localServerQueue.songs[0].url}`)
              .setDescription(
                  `Please Screenshot this message along with any other relevent info, 
                          and DM it to **Eugene#3399** if you have a GitHub Profile I would appreciate a comment on
                          the AudioPlayerError issue at [Smoothies Repo](https://github.com/y0Phoenix/Smoothy/issues/1).`
              )
              .setThumbnail(
                  `https://github.com/y0Phoenix/Smoothy/blob/main/Smoothy%20Logo.png?raw=true`
              )
              .setImage(`${localServerQueue.songs[0].thumbnail}`)
              .setTimestamp();
              localServerQueue.message.channel.send({ embeds: [audioPlayerErrME] });
              localServerQueue.player.stop();
              this.audioPlayerIdle();
          }
          }, 1500);
      });
  
      //when the audioPlayer for this class inside is Idle the function is executed
      this.player.on(AudioPlayerStatus.Idle, async () => {
          this.audioPlayerIdle();
      });
    // this is meant for when the player throws an error and the error is corrected, its needed to send a nowplaying message   
      this.player.on(AudioPlayerStatus.Playing, async () => {
          const localServerQueue: Queue = this;
          if (localServerQueue.audioPlayerErr === true && localServerQueue.tries > 0) {
          console.log('Retries Successfull');
          localServerQueue.audioPlayerErr = false;
          localServerQueue.tries = 0;
          if (localServerQueue.loopsong === false && localServerQueue.audioPlayerErr === false && localServerQueue.messagesent === false) {
              localServerQueue.nowPlaying = await this.nowPlayingSend();
              localServerQueue.messagesent = true;
              writeGlobal('update queue', localServerQueue, localServerQueue.id)
          }
          }
      });
    }
}