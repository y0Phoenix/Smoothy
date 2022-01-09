import * as spell from 'simple-spellchecker';
const dictionary: any = spell.getDictionarySync('en-US');
dictionary.addRegex(/i/);
import * as playdl from 'play-dl';
import { deleteMsg, distance, topResult } from '../modules/modules';
import {MessageEmbed, Message} from 'discord.js';
import * as ytsearch from 'yt-search';
import getMaps from '../maps';
import { Idle } from '../Classes/Idle';

// TODO implement fallback for playdl.search with yt-search, just incase playdl.search doesn't return an array
/**
 * @param  {string} q the video you wish to search
 * @returns {playdl.YouTubeVideo} the closest match to the search query
 * @description searches youtube for videos matching the search query and 
 * checks the distance between both strings and returns the closest match
 */
export default async function videoFinder(query: string, message: any) {
	const {DisconnectIdle} = getMaps();
	let sdi: Idle = DisconnectIdle.get(message.guild.id);
	if (sdi.top5Results[0]) {
		const i = parseInt(query);
		if (isNaN(i)) {
			const msg = await message.channel.send({embeds: [new MessageEmbed()
				.setColor('RED')
				.setDescription('Please Enter A Number 1-5 From The Top5 Results')]});
			deleteMsg(msg, 30000, sdi.client);
			return false
		}
		const temp = {...sdi.top5Results[i - 1]};
		sdi.top5Results = [];
		return temp;
	}
	let name = query.toLowerCase();
	const regex = /;|,|\.|>|<|'|"|:|}|{|\]|\[|=|-|_|\(|\)|&|^|%|$|#|@|!|~|`|\s/ig;
	name = name.replace(regex, '');
	let Name = name.split(' ');
	const loop = (test: string) => {
		for (let i = 0; i < Name.length; i++) {
			const re = new RegExp(Name[i], 'g');
			const includes = re.test(test);
			if (!includes) {
				return false
			}
		}
		return true
	}
	const emebdPush = async (video: any) => {
		let embeds = [];
		const length: number = video.length >= 5 ? 5 : video.length;
		for (let i = 0; i < length; i++) {
			sdi.top5Results.push(video[i]);
			const whichEmbed = new MessageEmbed()
			.setColor('FUCHSIA')
			.setTitle('Top 5 Results')
			.setDescription('No good natches were found for your search please select one via -play')
			.setFields(
				{
				name: `${i + 1}: `, value: `**[${video[i].title}](${video[i].url})**`
				},
			)
			;
			embeds.push(whichEmbed);
		}
		sdi.top5Msg = await message.channel.send({embeds: embeds});
	}
	try {
		const videoResult: playdl.YouTubeVideo[] = await playdl.search(name);
		if (videoResult[0]) {
			let vid = videoResult[0].title.toLowerCase();
			vid = vid.replace(regex, '');
			const bool = loop(vid);
			if (!bool) {
				for (let i = 0; i < Name.length; i++) {
					const check = dictionary.spellCheck(Name[i]);
					if (!check) {
						let suggs = dictionary.getSuggestions(Name[i]);
						Name[i] = suggs[0];
					}
				}
				name = Name.join(' ');
				const videoResult = await playdl.search(name);
				if (videoResult[0]) {
					let vid = videoResult[0].title.toLowerCase();
					vid = vid.replace(regex, '');
					const bool = loop(vid);
					if (bool) {
						return videoResult[0];
					} else {
					emebdPush(videoResult);
					return false
					}
				}
			}
			else {
				return videoResult[0]
			}
			return null;
		}
		else {
			const videoResult = await ytsearch(name);
			if (videoResult.videos[0]) {
				let vid = videoResult.videos[0].title;
				vid.replace(regex, '');
				vid.toLowerCase();
				const bool = loop(vid);
				if (bool) {
					return videoResult.videos[0];
				}
				else {
					emebdPush(videoResult.videos)
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
