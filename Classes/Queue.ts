import { Message } from 'discord.js';
import {queue} from '../main';
import _Queue from '../interfaces/_Queue';
import { distance } from '../modules/modules';

import ytSearch from 'yt-search';
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
import fs from 'fs';
import playdl from 'play-dl';
import _Song from '../interfaces/_Song';


export default class Queue {
    message: Message
    id : string
    voiceChannel: any
    voiceConnection: VoiceConnection
    songs: Partial<_Song>[]
    shuffledSongs: Partial<_Song>[]
    currentsong: Partial<_Song>[]
    stop: boolean
    jump: number = 0
    tries: number = 0
    audioPlayerErr: boolean = false
    player: AudioPlayer = null
    resource: AudioResource
    subsciption: PlayerSubscription = null
    previous: Partial<_Song>[]
    previousbool: boolean = false
    messagesent: boolean = false
    nowPlaying: Message = null
    nowPlayingTimer: any = null
    shuffle: boolean = false
    loop: boolean = false
    loopsong: boolean = false
    repeat: boolean = false
    playlist: boolean = false
    bool: boolean = false
    jumpbool: boolean = false
    constructor(msg:Message) {
        this.message = msg;
        this.id = msg.guildId;
        this.voiceChannel = msg.member.voice.channel;    
    }
    
}