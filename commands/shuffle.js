const { MessageEmbed } = require("discord.js");
const {deleteMsg, leave, writeGlobal} = require('../modules');
//reordes the queue into a new array
module.exports = {
    name: 'shuffle',
    description: 'shuffles the current serverQueue',
    async shuffle(message, serverQueue){
        if(serverQueue.shuffle === false){
            if(serverQueue.songs.length > 1){
                serverQueue.shuffle = true
                serverQueue.shuffledSongs.push(serverQueue.songs[0]);
                console.log('Now shuffling the queue');
                const shuffleEmbed = new MessageEmbed()
                    .setColor('GREEN')
                    .setDescription(':thumbsup: I Am Now Shuffling The Queue :twisted_rightwards_arrows:')
                ;
                message.channel.send({embeds: [shuffleEmbed]})
                .then(msg => deleteMsg(msg, 60000, false));
                var songsLength = parseInt(serverQueue.songs.length);
                const randomNumber = () => {
                    return Math.floor(Math.random() * songsLength);
                }; 
                var end = 1;
                var i = undefined;
                //checks if the song being added already exists if it does true is returned
                const ifExists = async () => {
                    for(f = 0;
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
                const oneEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setDescription(':rofl: I Cannot Shuffle A 1 Song Queue')
                ;
                message.channel.send({embeds: [oneEmbed]})
                .then(msg => deleteMsg(msg, 30000, false));
            }
        }
        else{
            console.log('Returning the queue to original order');
            serverQueue.shuffle = false;
            serverQueue.shuffledSongs = [];
            const noShuffleEmbed = new MessageEmbed()
                .setColor('GREEN')
                .setDescription(':thumbsup: I Have Returned The Queue To Its Original Order')
            ;
            message.channel.send({embeds: [noShuffleEmbed]})
            .then(msg => deleteMsg(msg, 60000, false));
            writeGlobal('update queue', serverQueue, serverQueue.id);
        }
    }        
}