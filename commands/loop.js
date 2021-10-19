//sets serverQueue.loop to true if false, else sets it to false
module.exports = {
    name: 'loop',
    description: 'loops the current server queue',
    async loop(message, serverQueue,){
        if(serverQueue){   
            if(serverQueue.loop === false){
                serverQueue.loop = true;
                message.reply(':thumbsup: I Am Now Looping The Current Queue! :repeat:');
            }
            else{
                serverQueue.loop = false;
                message.reply('I Am No Longer Looping The Queue!')
            } 
        }
        else{
            message.reply(':rofl: No Queue To Loop :rofl:')
        }
    }
}