# Smoothy

![ ](https://img.shields.io/github/repo-size/y0Phoenix/Smoothy)
![ ](https://img.shields.io/github/issues/y0Phoenix/Smoothy)
![ ](https://img.shields.io/github/stars/y0Phoenix/Smoothy)
![ ](https://img.shields.io/github/license/y0Phoenix/Smoothy)

Discord Music Bot using Discord.js v13 and Node.js LTS with node-abort-controller

Smoothy is a Discord Music Bot, rich with usefull and easy to follow functions, it works quite well and does what you need it to.

![alt text](https://github.com/y0Phoenix/Smoothy/blob/development/pictures/Smoothy%20Logo.png?raw=true)


# Table of Contents
1. [Dependencies](#dependencies)
2. [Current Functionalities](#currentfunctionalities)
3. [Run Smoothy.exe](#runsmoothy.exe)
4. [Using Smoothy](#usingsmoothy)
4. [Smoothy Roadmap](#roadmap)

## Dependencies <a name="dependencies"></a>
* [node.js LTS version](https://nodejs.org/dist/v14.18.1/node-v14.18.1-x64.msi): ytdl-core currently doesn't work correctly with the latest nodejs.
* [ffMPEG](https://ffmpeg.org/download.html): Is required to convert the downloaded videos and is a depenency of discord.js.
* [discord.js v13](https://www.npmjs.com/package/discord.js?source=post_page-----7b5fe27cb6fa----------------------): The easiest version to utilize.
* [discord.js/voice](https://www.npmjs.com/package/@discordjs/voice): All voice channel functionalites are no longer built into discord.js itself. 
* [node-abort-controller](https://www.npmjs.com/package/node-abort-controller): Is required for LTS version of nodejs and disocrd.js v13 as LTS node doesn't have an abort controller built in.
* [tweetnacl](https://www.npmjs.com/package/tweetnacl): Is a dependency of discord.js.
* [ytdl-core](https://www.npmjs.com/package/ytdl-core): Is required to both search and create audio streams from a YouTube video.
* [yt-search](https://www.npmjs.com/package/yt-search): Is requred if want to find a video with search query instead of a pasted link.
* [node-ytpl](https://www.npmjs.com/package/ytpl): Is required to search for YouTube playlists specified with a link (only works with unlisted and public playlists)

## Current Fuctionalities <a name="currentfunctionalities"></a>
1. Message embeds for a cleaner more professional look when Smoothy replies to a command
2. Smoothy will automatically disconnect after 30 minutes on idle to save bandwith
3. If Smoothy Crashes it will join back the VC if disconnected and play the song that was playing with any other songs and info
### Plese note that the `-` is the default prefix. In order to check your servers prefix if it was changed type `myprefix` without the `-` and use that instead of `-`.
| Command      | Description 								         | Usage                        |
| ------------ | ------------------------------------------------------------------------------- | ---------------------------- |
| Play         | Plays a songs from youtube via search query or link 			         | `-p`, `-play` 	        |
| Skip         | Skips a song inside of a serverQueue 					         | `-s`, `-n`, `-skip`, `-next` |
| Pause        | Pauses the current song 						         | `-pause` 		        |
| Resume       | Resumes the paused song 						         | `-resume`                     |
| Volume	   | Changes the volume of the current song being played | `-volume`, `-v` |
| Stop         | Stops the current song and clears the queue 				         | `-stop`, `-clear`            |
| Loop         | Loops the queue foreverer until the command is entered again 		         | `-l`, `-loop`                |
| Shuffle      | Shuffles the song queue, then returns it to normal after entering command again | `-mix`, `-shuffle`           |
| Repeat       | Restarts the current song                                                       | `-repeat`, `-restart`        |
| Previous     | Plays the previous song and returns to the original song after                  | `-previous`, `-pr`           |
| Queue        | Lists out the current song queue with individual numbers for each song          | `-q`, `-queue`, `-list`      |
| Remove       | Removes a song from the queue via a specified number for the song or song name              | `-r`, `-remove` 	        |
| Leave        | Leaves the voice channel and clears the song queue 			         | `-dc`, `-die`, `-disconnect` |
| Jump         | Jumps to a song via number or name and removes that song from the queue 	         | `-j`, `-jump` 	        |
| PlayPlaylist | Plays a YouTube playlist thats either public or unlisted via link 	         | `-pp`, `-playplaylist`       |
| NowPlaying   | Sends a now playing message to the channel									| `-np`, `-nowplaying` |
| MyPrefix     | Displays the server current set prefix (default is `-`) 		         | `myprefix`                   |	
| ChangePrefix | Changes the individual servers prefix 					         | `-prefix`, `-changeprefix`,  |

## Run Smoothy.exe <a name="runsmoothy.exe"></a>
* This program is simple. All it does is checks if Smoothy is running and starts him if he isn't. **This is a windows only program you can check out the linux version inside the [RunSmoothy-Linux directory](https://github.com/y0Phoenix/Smoothy/tree/development/RunSmoothy-Linux) and read the readme.md file to learn more.**

* This program will also log the entire terminal if Smoothy threw an error and/or crahsed.

* All you have to do to configure this program is change the `directory`, `run.batfilename` and the `errorlogfilename` values at\
`(Run Smoothy.dll.config:4-6)`
```xml
        <appSettings>
		<add key="directory" value="C:\Users\choos\Documents\Dicord bots\Smoothy 1.4"/>
		<add key="run.batfilename" value="C:\Users\choos\Documents\Dicord bots\Smoothy 1.4\run.bat"/>
		<add key="errorlogfilename" value="C:\Users\choos\Documents\Dicord bots\Smoothy 1.4\error log.txt"/>
	</appSettings>
```

The program should then use the proper filenames and start Smoothy.

## Using Smoothy <a name="usingsmoothy"></a>
* In order to use Smoothy on your computer you will need to plugin your own bot token at `(main.js:141)`.
```js
}); 
client.login(''); 
```
* You will also need to install the required [Dependencies](#dependencies) in order to use the wide range of functions avalible with Smoothy. If you don't install all of them Smoothy will throw an erorr.

## Smoothy Roadmap <a name="roadmap"></a>
1. Audio Filters like bass boost, low quality, pich-control etc.

2. Full Spotify Support

3. Full SoundCloud Support