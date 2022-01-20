import {MessageEmbed} from 'discord.js';
import { deleteMsg } from '../../modules/modules';
import Queue from '../Queue';
import getMaps from '../../maps';

export default async function nowPlayingSend() {
    const serverQueue: Queue = this;
    const {DisconnectIdle} = getMaps();
    if (serverQueue.currentsong[0]) {
        if (serverQueue.nowPlaying) {
            await deleteMsg(serverQueue.nowPlaying, 0, DisconnectIdle.get(1));
            serverQueue.nowPlaying = undefined
        }
        const msg = serverQueue.message.channel.send({embeds: [new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`:thumbsup: Now Playing`)
            .setDescription(
            `:musical_note: ***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})***`
            )
            .addFields(
            {
                name: `Requested By`,
                value: `<@${serverQueue.currentsong[0].message.author.id}>`,
                inline: true,
            },
            {
                name: `***Duration***`,
                value: `${serverQueue.currentsong[0].duration}`,
                inline: true,
            }
            )
            .setThumbnail(`${serverQueue.currentsong[0].thumbnail}`)
        ]});
        return msg
    }
}