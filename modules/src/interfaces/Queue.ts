import { AudioPlayer, PlayerSubscription } from "@discordjs/voice";
import { Message } from "discord.js";

export default interface Queue {
    message: Message,
    id : string,
    voiceChannel: any,
    songs: [],
    shuffledSongs: [],
    currentsong: [],
    jump: number,
    tries: number,
    audioPlayerError: boolean,
    player: AudioPlayer,
    subsciption: PlayerSubscription,
    previous: [],
    previousbool: boolean,

}