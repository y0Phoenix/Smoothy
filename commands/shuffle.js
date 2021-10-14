//reordes the queue into a new array
module.exports = {
    name: 'shuffle',
    description: 'shuffles the current serverQueue',
    async shuffle(message, serverQueue){
        if(serverQueue.shuffle === false){
            if(serverQueue.songs.length > 1){
                serverQueue.shuffle = true
                serverQueue.shuffledSongs.push(serverQueue.songs[0]);
                message.reply(':thumbsup: I Am Now Shuffling The Queue');
                var songsLength = parseInt(serverQueue.songs.length);
                var randomNumber = () => {
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
            }
            else{
                message.reply(':rofl: I Cannot Shuffle A 1 Song Queue :rofl:')
            }
        }
        else{
            serverQueue.shuffle = false;
            serverQueue.shuffledSongs = [];
            message.reply(':thumbsup: I Have Returned The Queue To Its Original Order');
        }
    }        
}