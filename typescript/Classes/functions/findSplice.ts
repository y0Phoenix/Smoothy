import Queue from "../Queue";
import { Song } from "../Song";

/**
 * @param {any} song the song with which to splice out of the song array
 * @description finds the currentsong specified in the params and removes it from the Queue 
 */
 export default function findSplice(song: Partial<Song>) {
    const serverQueue: Queue = this;
     const title = song.title;
     for (let i = 0; i < serverQueue.songs.length; i++) {
         if (title === serverQueue.songs[i].title) {
             if (i === 0) {
                 serverQueue.songs.shift();
             } else {
                 console.log(`Splicing ${serverQueue.songs[i].title} ${i}`);
                 serverQueue.songs.splice(i, 1);
             }
         }
     }
 }
 