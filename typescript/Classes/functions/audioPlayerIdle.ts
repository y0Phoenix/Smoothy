import {Idle} from "../Idle";
import { AudioPlayerStatus } from "@discordjs/voice";
import { deleteMsg, writeGlobal } from "../../modules/modules";
import { MessageEmbed } from "discord.js";
import Queue from "../Queue";
import getMaps from "../../maps";

/**
 * @description sets of functions and/or events based off of conditions
 */
export default async function audioPlayerIdle() {
    let serverQueue: Queue = this;
    const maps = getMaps();
    const {DisconnectIdle, queue} = maps
    const serverDisconnectIdle: Idle = DisconnectIdle.get(serverQueue.id);
    console.log('Player Status Is Idle');
    const noMoreSongsEmbed = new MessageEmbed()
      .setColor('RED')
      .setDescription(`:x: No More Songs To Play`)
    ;
    if (serverQueue.stop === true) {
    } else {
      if (serverQueue.player.state.status === AudioPlayerStatus.Idle && !serverQueue.audioPlayerErr) {
        serverQueue.messagesent = false;
        if (serverQueue.nowPlaying) {
          deleteMsg(serverQueue.nowPlaying, 0, serverDisconnectIdle.client);
          serverQueue.nowPlaying = undefined;
        }
        if (serverQueue.jumpbool === true) {
          serverQueue.jumpbool = false;
        }
        // song ending while previous is true
        if (serverQueue.previousbool) {
          serverQueue.playNext();
          serverQueue.currentsong.shift();
          serverQueue.bool = true;
        }
        else {
          serverQueue.previous.shift();
          serverQueue.previous.push(serverQueue.currentsong[0]);
          //normal song ending
          if (!serverQueue.loop && !serverQueue.loopsong && !serverQueue.shuffle && serverQueue.jump === 0 && !serverQueue.repeat) {
            serverQueue.bool ? serverQueue.bool = false : serverQueue.songs.shift();
            if (serverQueue.songs.length > 0) {
              serverQueue.playNext();
            } else {
             serverQueue.message.channel.send({embeds: [noMoreSongsEmbed]});
              queue.delete(serverQueue.message.guild.id);
              await writeGlobal('delete queue', null, serverQueue.id);
              writeGlobal('delete dci', null, serverQueue.id);
              serverDisconnectIdle.disconnectTimervcidle();
            }
          }
          //song ending while loop is true and loopsong is false
          else if (serverQueue.loop === true && serverQueue.loopsong === false && serverQueue.shuffle === false && serverQueue.jump === 0 && 
            serverQueue.repeat === false) {
            serverQueue.loopNextSong();
            console.log('Playing Next Song In Looped Queue');
          }
          //song ending whil loopsong is true
          else if (serverQueue.loopsong === true) {
            console.log('Playing Looped Current Song');
            serverQueue.playNext();
          }
          //song ending while repeat is true
          else if (serverQueue.repeat === true) {
            serverQueue.playNext();
          }
          //song ending while jump > 0
          else if (serverQueue.jump > 0) {
            serverQueue.playNext();
          }
          //song ending while shuffle is true
          else {
            if (serverQueue.shuffle === true && serverQueue.loop === true) {
              serverQueue.loopNextSong();
            } else {
              const currentsong = serverQueue.shuffledSongs[0];
              serverQueue.findSplice(currentsong);
              serverQueue.shuffledSongs.shift();
              if (serverQueue.shuffledSongs.length > 0) {
                serverQueue.playNext();
              } else {
                const noMoreSongsEmbed = new MessageEmbed()
                  .setColor('RED')
                  .setDescription(`:x: No More Songs To Play`)
                ;
                serverQueue.message.channel.send({embeds: [noMoreSongsEmbed]});
                queue.delete(serverQueue.message.guild.id);
                writeGlobal('delete queue', null, serverQueue.id);
                serverDisconnectIdle.disconnectTimervcidle();
              }
            }
          }
        }
      } else {
      }
    }
  }