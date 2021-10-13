//stops the audioPlayer and sets serverQueue.repeat to true, which is used inside of executive.js
module.exports = {
    name: 'repeat',
    description: 'repeats the current song',
    repeat(message, serverQueue){
        if(serverQueue){
            if(serverQueue.songs.lenght > 0){
                serverQueue.player.stop();
                serverQueue.repeat = true
                message.reply(`:thumbsup: I Am Restarting ***${serverQueue.songs[0].title}*** :thumbsup:`)
            }
            else{
                message.reply(':rofl: Not Currently Playing Anything At The Moment :rofl:')
            }
        }
        else{
            message.reply(':rofl: Not Currently Playing Anything At The Moment :rofl:')
        }
    }
}