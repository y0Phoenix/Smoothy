# Smoothy
Discord Music Bot using Discord.js v13 and Node.js LTS with node-abort-controller

Smoothy is currently a barebones Discord Music Bot, however it works quite well and does what you need it to.

# Dependencies
* [node.js LTS version](https://nodejs.org/dist/v14.18.1/node-v14.18.1-x64.msi): ytdl-core currently doesn't work correctly with the latest nodejs.
* [ffMPEG](https://ffmpeg.org/download.html): Is required to convert the downloaded videos and is a depenency of discord.js.
* [discord.js v13](https://www.npmjs.com/package/discord.js?source=post_page-----7b5fe27cb6fa----------------------): The easiest version to utilize.
* [discord.js/voice](https://www.npmjs.com/package/@discordjs/voice): All voice channel functionalites are no longer built into discord.js itself. 
* [node-abort-controller](https://www.npmjs.com/package/node-abort-controller): Is required for LTS version of nodejs and disocrd.js v13 as LTS node doesn't have an abort controller built in.
* [tweetnacl](https://www.npmjs.com/package/tweetnacl): Is a dependency of discord.js.
* [ytdl-core](https://www.npmjs.com/package/ytdl-core): Is required to both search and create audio streams from a YouTube video.
* [yt-search](https://www.npmjs.com/package/yt-search): Is requred if want to find a video with search query instead of a pasted link.

# Current Fuctionalities
1. Message embeds for a cleaner more professional look when Smoothy replies to a command
2. Smoothy will automatically disconnect after 30 minutes on idle to save bandwith
3. Play songs from youtube via search query or link
4. Skip a song inside of a serverQueue
5. Pause the current song 
6. Resume the current song
7. Stop the serverQueue
8. Loop the current serverQueue
9. Loop the current song
10. Repeat the current song
11. List out the current queue as numbered songs and 'requested by' for each song
12. Remove a specified song via number in the serverQueue
13. Leave the voice channel

# Run Smoothy.exe
* This program is simple. All it does is checks if Smoothy is running and starts him if he isn't.

* It also will log the entire terminal if Smoothy threw an error and/or crahsed.

* All you have to do to configure this program is change the 'directory', 'run.batfilename' and the 'errorlogfilename' values at\
**(Run Smoothy.dll.config:4-6)**
```
        <appSettings>
		<add key="directory" value="C:\Users\choos\Documents\Dicord bots\Smoothy 1.4"/>
		<add key="run.batfilename" value="C:\Users\choos\Documents\Dicord bots\Smoothy 1.4\run.bat"/>
		<add key="errorlogfilename" value="C:\Users\choos\Documents\Dicord bots\Smoothy 1.4\error log.txt"/>
	</appSettings>
```

The program should then use the proper filenames and start Smoothy.

# Using Smoothy
* In order to use Smoothy on your computer you will need to plugin your own bot token at **(main.js:74)**.
```
}); 
client.login(''); 
```


* You can also change the prefix to whatever you please at **(main.js:3)**.
```
const prefix = '-';
```


