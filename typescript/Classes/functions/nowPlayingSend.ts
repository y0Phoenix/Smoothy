import {EmbedBuilder} from 'discord.js';
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
        const msg = serverQueue.message.reply({embeds: [new EmbedBuilder()
            .setColor('#0099ff')
            .setDescription(`***[${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url})***`)
            .setAuthor({name: `Now Playing`, iconURL: 'https://cdn.discordapp.com/attachments/778600026280558617/781024479623118878/ezgif.com-gif-maker_1.gif'})
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