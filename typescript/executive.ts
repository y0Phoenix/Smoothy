	//executive file holds all the executive functions and is the largest file
	import * as ytpl from 'ytpl';
	import {writeGlobal, deleteMsg } from './modules/modules';
	import {
	joinVoiceChannel,
	VoiceConnectionStatus,
	} from '@discordjs/voice';
	import { MessageEmbed, Message, Client, VoiceChannel, CommandInteractionOptionResolver } from 'discord.js';
	import { Idle } from './Classes/Idle';
	import { ErrorSong, PlaylistSong, Song } from './Classes/Song';
	import Queue from './Classes/Queue';
	import validURL from './functions/validURL' ;
	import videoFinder from './functions/videoFinder';
	import * as ytdl from 'ytdl-core';
	import InfoData from './interfaces/_InfoData';
	import * as playdl from 'play-dl';

	const noVidEmbed = new MessageEmbed()
	.setColor('RED')
	.setDescription(':rofl: No ***video*** results found or cant play');


	/**
	 * @param  {} message the users message
	 * @param  {} queue the map that hols all of the Queue
	 * @param  {} DisconnectIdle the map that holds all of the Idles
	 * @param  {} serverDisconnectIdle the current servers Idle
	 * @param  {} serverQueue the current servers Queue
	 * @param  {} videoURL the ytdl video
	 * @description checks if a serverQueue exists if it doesn't it creates one and pushes it to the queue map then it continues onto {@link play}, else it pushes a new Song to the serverQueue.songs array
	 */
	async function executive(message: Message, queue: any, DisconnectIdle: any, serverDisconnectIdle: Idle, serverQueue: Queue, videoURL: InfoData) {
	serverDisconnectIdle = DisconnectIdle.get(message.guild.id);
	const client = DisconnectIdle.get(1);
	if (!serverDisconnectIdle) {
	DisconnectIdle.set(message.guild.id, new Idle({message: message, client: client}));
	serverDisconnectIdle = DisconnectIdle.get(message.guild.id);
	}
	else {
	if (serverDisconnectIdle.disconnectTimer !== undefined) {
		clearTimeout(serverDisconnectIdle.disconnectTimer);
		console.log('Cleared Timout For disconnectTimer');
	}
	}
	//checks if a serverQueue exists if it doesn't it creates the queue, else the song is pushed into serverQueue.songs
	if (!serverQueue) {
	const _queue = new Queue({msg: message});
	queue.set(message.guild.id, _queue);
	serverQueue = queue.get(message.guild.id);
	const songObj = new Song({message: message, data: videoURL});
	serverQueue.songs.push(songObj);
	serverQueue.currentsong.push(songObj);
	writeGlobal('add queue', serverQueue, serverQueue.id);
	serverQueue.play();
	}
	else {
		let songObj = new Song({message: message, data: videoURL});
		serverQueue.songs.push(songObj);
		writeGlobal('update queue', serverQueue, serverQueue.id);
		const addQueueEmbed = new MessageEmbed()
		.setColor('YELLOW')
		.setDescription(`***[${videoURL.videoDetails.title}](${videoURL.videoDetails.video_url})***
		Has Been Added To The Queue :arrow_down:`)
		;
		let msg = await message.channel.send({ embeds: [addQueueEmbed] });
		serverDisconnectIdle.msgs.push(msg);
		writeGlobal('update dci', serverDisconnectIdle, serverDisconnectIdle.id);
	}
	}
	/**
	 * @param  {Message} message the users Message
	 * @param  {any} args the users Message content without the command or prefix
	 * @param  {any} queue the map that holds all of the server Queues
	 * @param  {any} DisconnectIdle the map the holds all of the server Idles
	 * @param  {Idle} serverDisconnectIdle the current servers Idle
	 * @param  {Queue} serverQueue the current servers Queue
	 * @description find the video via ytdl-core and args and continues onto {@link executive}
	 */
	async function FindVideoCheck(message: Message, args: any, queue: any, DisconnectIdle: any, serverDisconnectIdle: Idle, serverQueue: Queue) {
	let videoName: string;
	if (Array.isArray(args)) {
		videoName = args.join(' ');
	}
	else {
		videoName = args;
	}
		let URL = validURL(videoName);
	if (URL === true) {
		const bool = videoName.includes('spotify');
	if (bool) {
		const temp = playdl.spotify(videoName);
		console.log('spotify');
	}
	var videoURL;
	try {
		videoURL = await ytdl.getBasicInfo(videoName);
	} catch (err) {
		console.log(`Error On ytdl-core url ${videoName}`);
		return message.channel.send({embeds: [new MessageEmbed() 
		.setColor('RED')
		.setDescription('Sorry Cannot Play This Video As It Is Age Restricted')
	]}).then(msg => {
		deleteMsg(msg, 30000, DisconnectIdle.get(1));
	})
		// TODO add age restricted video functionality
		// const temp = await playdl.video_basic_info(videoName);
		// videoURL = new ErrorSong({ song: temp, message: message });
	}
	if (videoURL) {
		console.log(`Found ${videoURL.videoDetails.title}`);
		executive(message, queue, DisconnectIdle, serverDisconnectIdle, serverQueue, videoURL);
	} else {
		message.channel
			.send({ embeds: [noVidEmbed] })
			.then((msg) => deleteMsg(msg, 30000, serverDisconnectIdle.client));
		return;
	}
	} else {
	const video: any = await videoFinder(videoName, message);
	if (video) {
		try {
			const videoURL = await ytdl.getBasicInfo(video.url);
			console.log(`Found ${videoURL.videoDetails.title}`);
			executive(message, queue, DisconnectIdle, serverDisconnectIdle, serverQueue, videoURL);
		} catch (err) {
			const msg = await message.channel.send({embeds: [new MessageEmbed()
				.setColor('RED')
				.setDescription(`Failed To Play **[${video.title}](${video.url})** As It Is Age Restricted. Try A Different Video`)]});
			deleteMsg(msg, 35000, serverDisconnectIdle.client);
			if (serverQueue) {
				serverQueue.player.stop();
				serverQueue.audioPlayerIdle();
			}
			return;
		}
	} else {
		if (video === false) {
		return;
		}
		message.channel
		.send({ embeds: [noVidEmbed] })
		.then((msg) => deleteMsg(msg, 30000, serverDisconnectIdle.client));
		return;
	}
	}
	}
	/**
	 * @param  {Message} message the users Message
	 * @param  {any} args the users Message content without the command and prefix
	 * @param  {any} queue the map that holds all of the Queues
	 * @param  {any} DisconnectIdle the map that holds all of the Idles
	 * @param  {Idle} serverDisconnectIdle the current servers Idles
	 * @param  {Queue} serverQueue the current servers Queue
	 * @description finds the YouTube playlist via ytpl via args, goes to {@link executive} if a serverQueue doesn't exists, then pushes the data into the serverQueue.songs array
	 */
	async function findvideoplaylist(message: Message, args: any, queue: any, DisconnectIdle: any, serverDisconnectIdle: Idle, serverQueue: Queue) {
		serverDisconnectIdle = DisconnectIdle.get(message.guild.id);
		if (serverDisconnectIdle.disconnectTimer !== undefined) {
		clearTimeout(serverDisconnectIdle.disconnectTimer);
		console.log('Cleared Timout For disconnectTimer');
		}
		const videoName = args.join(' ');
		if (videoName.includes('/playlist')) {
		const playlist = await ytpl(videoName);
		var added = false;
		if (playlist) {
			const videoURL = await ytdl.getBasicInfo(playlist.items[0].shortUrl);
			const playlistEmbed = new MessageEmbed()
			.setColor('GOLD')
			.setTitle(`Found YouTube Playlist`)
			.setDescription(
				`:notes: ***[${playlist.title}](${playlist.url})***
						All The Songs Will Be Added To The Queue!`
			)
			.addFields(
				{
				name: 'Requested By',
				value: `<@${message.author.id}>`,
				inline: true,
				},
				{
				name: 'Song Count',
				value: `**${playlist.estimatedItemCount}**`,
				}
			)
			.setThumbnail(`${playlist.bestThumbnail.url}`)
			.setTimestamp();
			console.log(`Found YouTube playlist ${playlist.title}`);
			if (!serverQueue) {
				queue.set(message.guild.id, new Queue({msg: message}));
				serverQueue = queue.get(message.guild.id);
				serverQueue.songs.push(new Song({message: message, data: videoURL}));
				serverQueue.currentsong.push(new Song({message: message, data: videoURL}));
				serverQueue.messagesent = true;
				console.log('Created the serverQueue');
				added = true;
				writeGlobal('add queue', serverQueue, serverQueue.id);
				serverQueue.play();
			}
			let msg = await message.channel.send({embeds: [playlistEmbed],});
			serverDisconnectIdle.msgs.push(msg);
			writeGlobal('update dci', serverDisconnectIdle, serverDisconnectIdle.id);
			for (let i = 0; i < playlist.items.length; i++) {
			if (added === true) {
				added = false;
			} else {
				const songObj = new PlaylistSong({message: message, playlist: playlist.items[i]})
				serverQueue.songs.push(songObj);
			}
			}
			writeGlobal('update queue', serverQueue, serverQueue.id);
		} else {
			const noPlaylistEmbed = new MessageEmbed()
			.setColor('RED')
			.setDescription(':rofl: Playlist Either Doesnt Exist Or Is Private');
			message.channel
			.send({ embeds: [noPlaylistEmbed] })
			.then((msg) => deleteMsg(msg, 30000, serverDisconnectIdle.client));
		}
		} else {
		const wrongEmbed = new MessageEmbed()
			.setColor('RED')
			.setDescription(':rofl: You Need To Add A Valid Playlist Link');
		message.channel
			.send({ embeds: [wrongEmbed] })
			.then((msg) => deleteMsg(msg, 30000, serverDisconnectIdle.client));
		}
	}

	async function joinvoicechannel(message: Partial<Message>, vc: Message['member']['voice']['channel'], DisconnectIdle: Map<any, any>, serverDisconnectIdle: Idle, client: Client, bool: any) {
		if (VoiceConnectionStatus.Disconnected) {
			const VoiceConnection = joinVoiceChannel({
			channelId: vc.id,
			guildId: vc.guild.id, 
			adapterCreator: vc.guild.voiceAdapterCreator,
			});
		//sets the DisconnectIdle map
		if (!serverDisconnectIdle) {
			if (bool) {
			DisconnectIdle.set(message.guild.id, bool);
			}
			else {
			DisconnectIdle.set(message.guild.id, new Idle({message: message, client: client}));
			await writeGlobal('add dci', DisconnectIdle.get(message.guild.id), message.guild.id);
			}
		}
		return VoiceConnection;
		}
	}

	export {  
	FindVideoCheck, 
	findvideoplaylist, 
	joinvoicechannel};
