import { Message } from 'discord.js';
import _Queue from '../interfaces/_Queue';
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
import playdl from 'play-dl';
import {Song} from './Song';
import { retryTimer, checkIfPlaying } from './functions/retryPlayer';
import { writeGlobal } from '../modules/modules';
import findSplice from './functions/findSplice';
import loopNextSong from './functions/loopNextSong';
import playNext from './functions/playNext';


export default class Queue {
    message: Partial<Message>
    id : string
    voiceChannel: any
    voiceConnection: VoiceConnection
    songs: Partial<Song>[] = []
    shuffledSongs: Partial<Song>[] = []
    currentsong: Partial<Song>[] = []
    stop: boolean
    jump: number = 0
    tries: number = 0
    audioPlayerErr: boolean = false
    player: AudioPlayer
    resource: AudioResource
    subsciption: PlayerSubscription
    previous: Partial<Song>[] = []
    previousbool: boolean = false
    messagesent: boolean = false
    nowPlaying: Partial<Message> = null
    nowPlayingTimer: any = null
    shuffle: boolean = false
    loop: boolean = false
    loopsong: boolean = false
    repeat: boolean = false
    bool: boolean = false
    jumpbool: boolean = false
    videoFinder: typeof videoFinder
    validURL: typeof validURL
    playnext: typeof playNext 
    findSplice: typeof findSplice
    loopNextSong: typeof loopNextSong
    
    constructor(data: any) {
        const {queue, DisconnectIdle, serverDisconnectIdle, msg} = data;
        this.message = msg;
        this.id = msg.guild.id;
        this.voiceChannel = msg.member.voice.channel;
        this.player = createAudioPlayer();
        this.voiceConnection = getVoiceConnection(msg.guild.id);
        this.subsciption = this.voiceConnection.subscribe(this.player);

        this.player.on('error', async (err) => {
          const localServerQueue: any = err.resource.metadata;
          localServerQueue.audioPlayerErr = true;
          console.log(`Audio Player Threw An Err`);
          setTimeout(async () => {
          if (localServerQueue.tries < 5) {
              localServerQueue.player.stop();
              await retryTimer(
              localServerQueue,
              queue,
              DisconnectIdle,
              serverDisconnectIdle
              );
              localServerQueue.tries++;
              const playing = await checkIfPlaying(localServerQueue);
              if (playing === true) {
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
              audioPlayerIdle(
              localServerQueue,
              queue,
              DisconnectIdle,
              serverDisconnectIdle
              );
          }
          }, 1500);
      });
  
      //when the audioPlayer for this construct inside serverQueue is Idle the function is executed
      this.player.on(AudioPlayerStatus.Idle, async (playerEvent) => {
          //resource.metadata is set inside of the async play function
          const localServerQueue = playerEvent.resource.metadata;
          audioPlayerIdle(
          localServerQueue,
          queue,
          DisconnectIdle,
          serverDisconnectIdle
          );
      });
      this.player.on(AudioPlayerStatus.Playing, async (data) => {
          const localServerQueue = data.resource.metadata;
          if (
          localServerQueue.audioPlayerErr === true &&
          localServerQueue.tries > 0
          ) {
          console.log('Retries Successfull');
          localServerQueue.audioPlayerErr = false;
          localServerQueue.tries = 0;
          if (
              localServerQueue.loopsong === false &&
              localServerQueue.audioPlayerErr === false &&
              localServerQueue.messagesent === false
          ) {
              const playembed = new MessageEmbed()
              .setColor('#0099ff')
              .setTitle(`:thumbsup: Now Playing`)
              .setDescription(
                  `:musical_note: ***[${localServerQueue.currentsong[0].title}](${localServerQueue.currentsong[0].url})*** :musical_note:`
              )
              .addField(
                  `Requested By`,
                  `<@${localServerQueue.currentsong[0].message.author.id ? localServerQueue.currentsong[0].message.author.id : localServerQueue.currentsong[0].message.authorId}>`
              )
              .setThumbnail(`${localServerQueue.currentsong[0].thumbnail}`)
              .setTimestamp();
              localServerQueue.nowPlaying = await localServerQueue.message.channel.send({ embeds: [playembed] });
              localServerQueue.messagesent = true;
              writeGlobal('update queue', localServerQueue, localServerQueue.id)
          }
          }
      });
        this.findSplice = findSplice;
        this.loopNextSong = loopNextSong;
        this.playnext = playNext;
    }
}