module.exports = {
    name: 'loopsong',
    description: 'loops the current song',
    async loopsong(message, serverQueue){
        if(serverQueue){
            if(serverQueue.loopsong === false){
                serverQueue.loopsong = true
                message.reply(`:thumbsup: Now Looping ***${serverQueue.currenttitle}***`)
            }
            else{
                serverQueue.loopsong = false
                message.reply(`:x: I Am No Longer Looping ***${serverQueue.currenttitle}***`)
            }
        }
    }
}