const { createAudioResource, StreamType, AudioPlayerStatus } = require('@discordjs/voice');
const { MessageEmbed } = require('discord.js');
const playdl = require('play-dl');
const prism = require('prism-media');
const { deleteMsg } = require('../modules');

async function seek(message, args, serverQueue, serverDisconnectIdle) {
    if (serverQueue) {
        if (serverQueue.songs.length > 0) {
            if (serverQueue.player.state.status === AudioPlayerStatus.Playing) {
                const msg = args.join(' ');
                const specChars = /(;|,|\.|:)/;
                msg = msg.replace(specChars, ',');
                msg = msg.split(',');
                var seek = 0;
                msg.forEach(element => {
                    element = element.parseInt(element);
                    if (isNaN(element)) {
                        const embed = new MessageEmbed()
                            .setColor('RED')
                            .setDescription(':rofl: Please Enter A Valid Seek Request Type -help If You Are Struggling To Figure It Out')
                        ;
                        const msg = await message.channel.send({embeds: [embed]});
                        deleteMsg(msg, 30000, false);
                        return;
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
            
                const highestaudio = serverQueue.currentsong[0].format[serverQueue.currentsong[0].format.length - 1].url;
            
                const finalArgs = [];
            
                finalArgs.push('-ss', `${seek}`, '-accurate_seek');
            
                finalArgs.push('-i', highestaudio);
            
                finalArgs.push(...FFMPEG_OPUS_ARGUMENTS);;
            
                const ffmpeg = new prism.FFmpeg({
                    args: finalArgs,
                });
            
                const resource = createAudioResource(ffmpeg, {
                    imputType: StreamType.OggOpus
                });
                serverQueue.player.play(resource);
                const seekEmbed = new MessageEmbed()
                    .setColor('GREEN')
                    .setDescription(`:thumbsup: Seeking [${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url}) To **${msg.join(',')}**`)
                ;
                let msg = await message.channel.send({embeds: [seekEmbed]}) ;
                deleteMsg(msg, 60000, false);
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

module.exports = { seek };