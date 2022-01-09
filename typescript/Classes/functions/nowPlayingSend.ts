import {MessageEmbed} from 'discord.js';

export default async function nowPlayingSend() {
    return await this.message.channel.send({embeds: [new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`:thumbsup: Now Playing`)
        .setDescription(
        `:musical_note: ***[${this.currentsong[0].title}](${this.currentsong[0].url})***`
        )
        .addFields(
        {
            name: `Requested By`,
            value: `<@${this.currentsong[0].message.author.id}>`,
            inline: true,
        },
        {
            name: `***Duration***`,
            value: `${this.currentsong[0].duration}`,
            inline: true,
        }
        )
        .setThumbnail(`${this.currentsong[0].thumbnail}`)
    ]});
}