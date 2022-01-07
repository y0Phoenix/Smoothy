import {Idle} from "../Idle";
import { playNext, findSplice, loopNextSong, disconnectTimervcidle } from "./executive";
import { AudioPlayerStatus } from "@discordjs/voice";
import { deleteMsg, writeGlobal } from "../../modules/modules";
import { MessageEmbed } from "discord.js";
import Queue from "../Queue";

/**
 * @param  {Queue} serverQueue the current servers queue
 * @param  {any} queue the map that holds all of the serverQueus
 * @param  {any} DisconnectIdle the map that holds all of the Idles
 * @param  {Idle} serverDisconnectIdle the current servers Idle
 */
export default async function audioPlayerIdle(
    serverQueue: Queue,
    queue: any,
    DisconnectIdle: any,
    serverDisconnectIdle: Idle
  ) {
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
          await serverQueue.nowPlaying.delete();
          serverQueue.nowPlaying = undefined;
        }
        if (serverQueue.jumpbool === true) {
          serverQueue.jumpbool = false;
        }
        // song ending while previous is true
        if (serverQueue.previousbool) {
          playNext(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
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
              playNext(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
            } else {
             serverQueue.message.channel.send({embeds: [noMoreSongsEmbed]}); 
              serverDisconnectIdle = DisconnectIdle.get(
                serverQueue.message.guild.id
              );
              queue.delete(serverQueue.message.guild.id);
              await writeGlobal('delete queue', null, serverQueue.id);
              writeGlobal('delete dci', null, serverQueue.id);
              disconnectTimervcidle(queue, DisconnectIdle, serverDisconnectIdle);
            }
          }
          //song ending while loop is true and loopsong is false
          else if (serverQueue.loop === true && serverQueue.loopsong === false && serverQueue.shuffle === false && serverQueue.jump === 0 && 
            serverQueue.repeat === false && serverQueue.previousbool === false) {
            loopNextSong(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
            console.log('Playing Next Song In Looped Queue');
          }
          //song ending whil loopsong is true
          else if (serverQueue.loopsong === true) {
            console.log('Playing Looped Current Song');
            playNext(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
          }
          //song ending while repeat is true
          else if (serverQueue.repeat === true) {
            playNext(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
          }
          //song ending while jump > 0
          else if (serverQueue.jump > 0) {
            playNext(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
          }
          //song ending while shuffle is true
          else {
            if (serverQueue.shuffle === true && serverQueue.loop === true && serverQueue.loopsong === false
               && serverQueue.jump === 0 && serverQueue.repeat === false && serverQueue.previousbool === false) {
              loopNextSong(
                serverQueue,
                queue,
                DisconnectIdle,
                serverDisconnectIdle
              );
            } else {
              const currentsong = serverQueue.shuffledSongs[0];
              findSplice(serverQueue, currentsong);
              serverQueue.shuffledSongs.shift();
              if (serverQueue.shuffledSongs.length > 0) {
                playNext(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
              } else {
                const noMoreSongsEmbed = new MessageEmbed()
                  .setColor('RED')
                  .setDescription(`:x: No More Songs To Play`)
                ;
                serverQueue.message.channel.send({embeds: [noMoreSongsEmbed]});
                serverDisconnectIdle = DisconnectIdle.get(
                  serverQueue.message.guild.id
                );
                queue.delete(serverQueue.message.guild.id);
                writeGlobal('delete queue', null, serverQueue.id);
                disconnectTimervcidle(queue, DisconnectIdle, serverDisconnectIdle);
              }
            }
          }
        }
      } else {
      }
    }
  }