import { checkIfPlaying, retryTimer } from "../Classes/functions/retryPlayer";
import audioPlayerIdle from "../Classes/functions/audioPlayerIdle";
import { MessageEmbed } from "discord.js";
import { deleteMsg, writeGlobal } from "../modules/modules";
import { AudioPlayerStatus } from "@discordjs/voice";

/**
 * @param  {} player the player to add events to
 * @param  {} serverDisconnectIdle the currents servers Idle
 * @param  {} queue the map that holds all of the server queues
 * @param  {} DisconnectIdle the map that holds all of the server Idles
 */
export default async function playerEvents(player, serverDisconnectIdle, queue, DisconnectIdle) {
    //this function executes when the player throws an error
    player.on('error', async (err) => {
        const localServerQueue = err.resource.metadata;
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
    player.on(AudioPlayerStatus.Idle, async (playerEvent) => {
        //resource.metadata is set inside of the async play function
        const localServerQueue = playerEvent.resource.metadata;
        audioPlayerIdle(
        localServerQueue,
        queue,
        DisconnectIdle,
        serverDisconnectIdle
        );
    });
    player.on(AudioPlayerStatus.Playing, async (data) => {
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
}