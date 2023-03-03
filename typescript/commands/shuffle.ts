import { EmbedBuilder, Message, Client, Colors } from "discord.js";
import Queue from "../Classes/Queue";
import {deleteMsg, leave, writeGlobal} from '../modules/modules';
import sendMessage from "../modules/src/sendMessage";
//reordes the queue into a new array

/**
 * @param  {Message} message the users Message
 * @param  {Queue} serverQueue the current servers Queue
 * @param  {Client} client the Smoothy Client
 * @description set the shuffle bool to true inside the serverQueue, uses a ramdon number and pushes a song via the random number 
 * into the shuffledSongs array inside the serverQueue thereby creating a shuffled song queue
 */
export default async function shuffle(message: Message, serverQueue: Queue, client: Client){
    if(serverQueue.shuffle === false){
        if(serverQueue.songs.length > 1){
            serverQueue.shuffle = true
            serverQueue.shuffledSongs.push(serverQueue.songs[0]);
            console.log('Now shuffling the queue');
            const shuffleEmbed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setDescription(':thumbsup: I Am Now Shuffling The Queue :twisted_rightwards_arrows:')
            ;
            sendMessage({embeds: [shuffleEmbed]}, message)
            .then(msg => deleteMsg(msg, 60000, client));
            var songsLength = serverQueue.songs.length;
            const randomNumber = () => {
                return Math.floor(Math.random() * songsLength);
            }; 
            var end = 1;
            var i = undefined;
            //checks if the song being added already exists if it does true is returned
            const ifExists = async () => {
                for(let f = 0;
                f < serverQueue.shuffledSongs.length;
                f++){
                    if(serverQueue.shuffledSongs[f] === song){
                        return true
                    }
                }
            };
            //adds songs to a new array until end === the amount of songs
            while(end !== songsLength){
                i = randomNumber();
                var song = serverQueue.songs[i];
                var exists = await ifExists(); 
                if(exists === true){
                }
                else{
                    serverQueue.shuffledSongs.push(song);
                    end++;
                }
            }
            writeGlobal('update queue', serverQueue, serverQueue.id);
        }
        else{
            console.log('Cant shuffled the queue only 1 song');
            const oneEmbed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription(':rofl: I Cannot Shuffle A 1 Song Queue')
            ;
            sendMessage({embeds: [oneEmbed]}, message)
            .then(msg => deleteMsg(msg, 30000, client));
        }
    }
    else{
        console.log('Returning the queue to original order');
        serverQueue.shuffle = false;
        serverQueue.shuffledSongs = [];
        const noShuffleEmbed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(':thumbsup: I Have Returned The Queue To Its Original Order')
        ;
        sendMessage({embeds: [noShuffleEmbed]}, message)
        .then(msg => deleteMsg(msg, 60000, client));
        writeGlobal('update queue', serverQueue, serverQueue.id);
    }
}        