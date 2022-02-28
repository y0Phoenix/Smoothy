import * as playdl from 'play-dl';
import { deleteMsg, distance, topResult } from '../modules/modules';
import {MessageEmbed, Message, Client} from 'discord.js';
import * as ytsearch from 'yt-search';
import getMaps from '../maps';
import { Idle } from '../Classes/Idle';

/**
 * @param  {string} q the video you wish to search
 * @returns {playdl.YouTubeVideo} the closest match to the search query
 * @description searches youtube for videos matching the search query and 
 * checks the distance between both strings and returns the closest match
 */
export default async function videoFinder(query: string, message: any) {
	const {DisconnectIdle} = getMaps();
	let sdi: Idle = DisconnectIdle.get(message.guild.id);
	const client: Client = DisconnectIdle.get(1);
	if (sdi.top5Results[0]) {
		const i = parseInt(query);
		if (isNaN(i)) {
			if (query === 'none') {
				const msg = await message.channel.send({embeds: [new MessageEmbed()
					.setColor('BLUE')
					.setDescription(':thumbsup: Okay Try Typing Your Search Again')]});
				deleteMsg(msg, 30000, client);
				deleteMsg(sdi.top5Msg, 0, client);
				sdi.top5Results = [];
				return false;
			}
			const msg = await message.channel.send({embeds: [new MessageEmbed()
				.setColor('RED')
				.setDescription('Please Enter A Number 1-3 From The Top3 Results')]});
			deleteMsg(msg, 30000, client);
			return false
		}
		const temp = {...sdi.top5Results[i - 1]};
		sdi.top5Results = [];
		await deleteMsg(sdi.top5Msg, 0, client);
		return temp;
	}
	let name = query.toLowerCase();
	const regex = /;|,|\.|>|<|'|"|:|}|{|\]|\[|=|-|_|\(|\)|&|^|%|$|#|@|!|~|`/ig;
	name = name.replace(regex, '');
	let Name = name.split(' ');

	const loop = (videos: any, length: number) => {
		let i = 0
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
	}

	const emebdPush = async (video: any, bool: boolean) => {
		let embeds = [];
		const length: number = 3;
		for (let i = 0; i < length; i++) {
			let thumbnail: string;
			if (video[i]?.thumbnail && video[i]?.thumbnails[0]) {
				thumbnail = bool ? video[i].thumbnails[0].url : video[i].thumbnail;
			}
			sdi.top5Results.push(video[i]);
			let title: MessageEmbed;
			let whichEmbed: MessageEmbed;
			if (i === 0) {
				title = new MessageEmbed()
				.setColor('FUCHSIA')
				.setTitle('Top 3 Results')
				.setDescription('No good natches were found for your search please select one via -play or select none via -play none')
				;
			}
			whichEmbed = new MessageEmbed()
			.setColor('FUCHSIA')
			.setFields(
				{
				name: `${i + 1}: `, value: `**[${video[i].title}](${video[i].url})**`
				},
			)
			.setThumbnail(thumbnail);
			if (title) {
				embeds.push(title);
			}
			embeds.push(whichEmbed);
		}
		sdi.top5Msg = await message.channel.send({embeds: embeds});
	}

	try {
		const videoResult: playdl.YouTubeVideo[] = await playdl.search(name);
		if (videoResult[0]) {
			let vid = videoResult[0].title.toLowerCase();
			vid = vid.replace(regex, '');
			const bool = loop(videoResult, 1);
			if (bool === -1) {
				const bool = loop(videoResult, 5);
				if (bool !== -1) {
					return videoResult[bool];
				} else {
				emebdPush(videoResult, true);
				return false
				}
			}
			else {
				return videoResult[0]
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
						return videoResult.videos[bool]
					}
					emebdPush(videoResult.videos, false)
					return false
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
