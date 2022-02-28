"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const playdl = require("play-dl");
const modules_1 = require("../modules/modules");
const discord_js_1 = require("discord.js");
const ytsearch = require("yt-search");
const maps_1 = require("../maps");
/**
 * @param  {string} q the video you wish to search
 * @returns {playdl.YouTubeVideo} the closest match to the search query
 * @description searches youtube for videos matching the search query and
 * checks the distance between both strings and returns the closest match
 */
async function videoFinder(query, message) {
    const { DisconnectIdle } = (0, maps_1.default)();
    let sdi = DisconnectIdle.get(message.guild.id);
    const client = DisconnectIdle.get(1);
    if (sdi.top5Results[0]) {
        const i = parseInt(query);
        if (isNaN(i)) {
            if (query === 'none') {
                const msg = await message.channel.send({ embeds: [new discord_js_1.MessageEmbed()
                            .setColor('BLUE')
                            .setDescription(':thumbsup: Okay Try Typing Your Search Again')] });
                (0, modules_1.deleteMsg)(msg, 30000, client);
                (0, modules_1.deleteMsg)(sdi.top5Msg, 0, client);
                sdi.top5Results = [];
                return false;
            }
            const msg = await message.channel.send({ embeds: [new discord_js_1.MessageEmbed()
                        .setColor('RED')
                        .setDescription('Please Enter A Number 1-3 From The Top3 Results')] });
            (0, modules_1.deleteMsg)(msg, 30000, client);
            return false;
        }
        const temp = { ...sdi.top5Results[i - 1] };
        sdi.top5Results = [];
        await (0, modules_1.deleteMsg)(sdi.top5Msg, 0, client);
        return temp;
    }
    let name = query.toLowerCase();
    const regex = /;|,|\.|>|<|'|"|:|}|{|\]|\[|=|-|_|\(|\)|&|^|%|$|#|@|!|~|`/ig;
    name = name.replace(regex, '');
    let Name = name.split(' ');
    const loop = (videos, length) => {
        let i = 0;
        for (i; i < length; i++) {
            for (let j = 0; j < Name.length; j++) {
                const re = new RegExp(Name[j], 'g');
                const title = videos[i].title.replace(regex, '').toLowerCase();
                const includes = re.test(title);
                if (!includes) {
                    return -1;
                }
            }
        }
        return i;
    };
    const emebdPush = async (video, bool) => {
        let embeds = [];
        const length = 3;
        for (let i = 0; i < length; i++) {
            const thumbnail = bool ? video[i].thumbnails[0].url : video[i].thumbnail;
            sdi.top5Results.push(video[i]);
            let title;
            let whichEmbed;
            if (i === 0) {
                title = new discord_js_1.MessageEmbed()
                    .setColor('FUCHSIA')
                    .setTitle('Top 3 Results')
                    .setDescription('No good natches were found for your search please select one via -play or select none via -play none');
            }
            whichEmbed = new discord_js_1.MessageEmbed()
                .setColor('FUCHSIA')
                .setFields({
                name: `${i + 1}: `, value: `**[${video[i].title}](${video[i].url})**`
            })
                .setThumbnail(thumbnail);
            if (title) {
                embeds.push(title);
            }
            embeds.push(whichEmbed);
        }
        sdi.top5Msg = await message.channel.send({ embeds: embeds });
    };
    try {
        const videoResult = await playdl.search(name);
        if (videoResult[0]) {
            let vid = videoResult[0].title.toLowerCase();
            vid = vid.replace(regex, '');
            const bool = loop(videoResult, 1);
            if (bool === -1) {
                const bool = loop(videoResult, 5);
                if (bool !== -1) {
                    return videoResult[bool];
                }
                else {
                    if (videoResult[0]?.thumbnails) {
                        emebdPush(videoResult, true);
                        return false;
                    }
                    return false;
                }
            }
            else {
                return videoResult[0];
            }
        }
        else {
            const videoResult = await ytsearch(name);
            if (videoResult.videos[0]) {
                let vid = videoResult.videos[0].title;
                vid.replace(regex, '');
                vid.toLowerCase();
                const bool = loop(videoResult.videos, 1);
                if (bool) {
                    return videoResult.videos[0];
                }
                else {
                    const bool = loop(videoResult.videos, 5);
                    if (bool) {
                        return videoResult.videos[bool];
                    }
                    emebdPush(videoResult.videos, false);
                    return false;
                }
            }
        }
    }
    catch (error) {
        console.log(`Videosearch error on ${query}`);
        let name = query.toLowerCase();
        const videoResult = await playdl.search(name);
        if (videoResult[0]) {
            return videoResult[0];
        }
    }
}
exports.default = videoFinder;
