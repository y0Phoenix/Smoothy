"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spell = require("simple-spellchecker");
const dictionary = spell.getDictionarySync('en-US');
dictionary.addRegex(/i/);
const playdl = require("play-dl");
const modules_1 = require("../modules/modules");
const discord_js_1 = require("discord.js");
const ytsearch = require("yt-search");
const maps_1 = require("../maps");
// TODO implement fallback for playdl.search with yt-search, just incase playdl.search doesn't return an array
/**
 * @param  {string} q the video you wish to search
 * @returns {playdl.YouTubeVideo} the closest match to the search query
 * @description searches youtube for videos matching the search query and
 * checks the distance between both strings and returns the closest match
 */
async function videoFinder(query, message) {
    const { DisconnectIdle } = (0, maps_1.default)();
    let sdi = DisconnectIdle.get(message.guild.id);
    if (sdi.top5Results[0]) {
        const i = parseInt(query);
        if (isNaN(i)) {
            if (query === 'none') {
                const msg = await message.channel.send({ embeds: [new discord_js_1.MessageEmbed()
                            .setColor('BLUE')
                            .setDescription(':thumbsup: Okay Try Typing Your Search Again')] });
                (0, modules_1.deleteMsg)(msg, 30000, sdi.client);
                (0, modules_1.deleteMsg)(sdi.top5Msg, 0, sdi.client);
                sdi.top5Results = [];
                return false;
            }
            const msg = await message.channel.send({ embeds: [new discord_js_1.MessageEmbed()
                        .setColor('RED')
                        .setDescription('Please Enter A Number 1-5 From The Top5 Results')] });
            (0, modules_1.deleteMsg)(msg, 30000, sdi.client);
            (0, modules_1.deleteMsg)(sdi.top5Msg, 0, sdi.client);
            sdi.top5Results = [];
            return false;
        }
        const temp = Object.assign({}, sdi.top5Results[i - 1]);
        sdi.top5Results = [];
        (0, modules_1.deleteMsg)(sdi.top5Msg, 0, sdi.client);
        return temp;
    }
    let name = query.toLowerCase();
    const regex = /;|,|\.|>|<|'|"|:|}|{|\]|\[|=|-|_|\(|\)|&|^|%|$|#|@|!|~|`|\s/ig;
    name = name.replace(regex, '');
    let Name = name.split(' ');
    const loop = (videos, length) => {
        let i = 0;
        for (i; i < length; i++) {
            const re = new RegExp(Name[i], 'g');
            const includes = re.test(videos[i].title);
            if (!includes) {
                return 0;
            }
        }
        return i;
    };
    const emebdPush = async (video, bool) => {
        let embeds = [];
        const length = video.length >= 5 ? 5 : video.length;
        for (let i = 0; i < length; i++) {
            const thumbnail = bool ? video[i].thumbnails[2].url : video[i].thumbnail;
            sdi.top5Results.push(video[i]);
            let title;
            let whichEmbed;
            if (i === 0) {
                title = new discord_js_1.MessageEmbed()
                    .setColor('FUCHSIA')
                    .setTitle('Top 5 Results')
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
            const bool = loop(vid, 1);
            if (!bool) {
                const bool = loop(videoResult, 5);
                if (bool) {
                    return videoResult[bool];
                }
                else {
                    emebdPush(videoResult, true);
                    return false;
                }
            }
            else {
                return videoResult[0].thumbnails[0].url;
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
