import { createAudioResource, StreamType, AudioPlayerStatus } from '@discordjs/voice';
import { MessageEmbed, Message } from 'discord.js';
import playdl from 'play-dl';
import * as prism from 'prism-media';
import { Idle } from '../Classes/Idle';
import Queue from '../Classes/Queue';
import { deleteMsg } from '../modules/modules';
/**
 * @param  {Message} message the users Message
 * @param  {any} args the users Mesage content without the prefix and command
 * @param  {Queue} serverQueue the current servers Queue
 * @param  {Idle} serverDisconnectIdle the current servers Idle
 * @description does some string manipulation which turns it into a number, creates an new ffmpeg instance with the seek number and plays the ffmpeg stream 
 * onto the audioplayer inside the serverQueue 
 */
export default async function seek(message: Message, args: any, serverQueue: Queue, serverDisconnectIdle: Idle) {
    // TODO fix message please enter a valid seek on a valid seek
    // TODO add varitation to seek, if a song is less than 1 min the user shoudln't need to enter 0.30 they should be able to just do 30
    if (serverQueue) {
        if (serverQueue.songs.length > 0) {
            if (serverQueue.player.state.status === AudioPlayerStatus.Playing) {
                let req = args.join(' ');
                const specChars = /(;|,|\.|:)/;
                req = req.replace(specChars, ',');
                req = req.split(',');
                var seek = 0;
                req.forEach(element => {
                    const index = req.map(num => num).indexOf(element);
                    element = parseInt(element);
                    if (isNaN(element)) {
                        const embed = new MessageEmbed()
                            .setColor('RED')
                            .setDescription(':rofl: Please Enter A Valid Seek Request Type -help If You Are Struggling To Figure It Out')
                        ;
                        message.channel.send({embeds: [embed]})
                        .then(msg => deleteMsg(msg, 30000, serverDisconnectIdle.client));
                        return;
                    }
                    if (index === 0 && req.length > 1 && req.length < 3) {
                        element = element * 60;
                    }
                    if (req.length === 0 && req.length > 2) {
                        element = element * 3600;
                        element = element* 60;
                    }

                    seek = seek + element;
                });

                const FFMPEG_OPUS_ARGUMENTS = [
                    '-analyzeduration',
                    '0',
                    '-loglevel',
                    '0',
                    '-acodec',
                    'libopus',
                    '-f',
                    'opus',
                    '-ar',
                    '48000',
                    '-ac',
                    '2',
                ];
            
                const video = await playdl.video_info(serverQueue.currentsong[0].url);

                if (seek >= serverQueue.currentsong[0].durationS) {
                    const toLong = new MessageEmbed()
                        .setColor('RED')
                        .setDescription(`:rofl: **${req.join(':')}** Is Longer Than The Song Length Of **${serverQueue.currentsong[0].duration}**`)
                    ;
                    let msg = await message.channel.send({embeds: [toLong]});
                    deleteMsg(msg, 30000, serverDisconnectIdle.client);
                    return
                }

                const highestaudio = video.format[video.format.length - 1].url;
            
                const finalArgs = [];
            
                finalArgs.push('-ss', `${seek}`, '-accurate_seek');
            
                finalArgs.push('-i', highestaudio);
            
                finalArgs.push(...FFMPEG_OPUS_ARGUMENTS);;
            
                const ffmpeg = new prism.FFmpeg({
                    args: finalArgs,
                });
            
                serverQueue.resource = createAudioResource(ffmpeg, {
                    // ignore error
                    inputType: StreamType.OggOpus
                });
                serverQueue.resource.metadata = serverQueue;
                serverQueue.player.play(serverQueue.resource);
                const seekEmbed = new MessageEmbed()
                    .setColor('GREEN')
                    .setDescription(`:thumbsup: Seeking [${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url}) To **${req.join(',')}**`)
                ;
                let msg = await message.channel.send({embeds: [seekEmbed]}) ;
                deleteMsg(msg, 60000, serverDisconnectIdle.client);
            }
            else {

            }
        }
        else {

        }
    }
    else {

    }
}
