import { Message } from 'discord.js';
import _Queue from '../interfaces/_Queue';
import audioPlayerIdle from './functions/audioPlayerIdle';
import ytpl from 'ytpl';
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
    player: AudioPlayer = null
    resource: AudioResource
    subsciption: PlayerSubscription = null
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
    
    constructor(msg:Message) {
        this.message = msg;
        this.id = msg.guild.id;
        this.voiceChannel = msg.member.voice.channel;
    }
}