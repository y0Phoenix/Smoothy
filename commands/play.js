//checks if a link was specified, if the user is inside of a voiceChannel, if Smoothy has permission to connect and if Smoothy has permission to speak
//then joins the voiceChannel and finds the video. Both functions are inside of executive.js 
const executive = require('../executive');
module.exports = {
    name:'play',
    description: 'plays the specified song',
    async play(message, args,  vc, queue, DisconnectIdle, serverDisconnectIdle, serverQueue, queueLoop, serverQueueLoop) {
        try{
            if (args.length === 0) return message.reply(':nerd: You Need To Specify With Either A ***Link*** Or ***Search*** ***Query*** :nerd:');
            if (!vc) return message.reply(':nerd: You Need To Be In A ***Voice Channel*** To Execute This Command :nerd:');
            const permissions = vc.permissionsFor(message.client.user);
            if (!permissions.has('CONNECT')) return message.reply(':nerd: I Dont Have The ***Permission To Connect*** :nerd:');
            if (!permissions.has('SPEAK')) return message.reply(':nerd: I Dont Have The ***Permissins To Speak*** :nerd:');
            
            executive.joinvoicechannel(message, vc, DisconnectIdle, serverDisconnectIdle);
            executive.FindVideoCheck(message, args, queue, DisconnectIdle, serverDisconnectIdle, serverQueue, queueLoop, serverQueueLoop);
        }
        catch(error) {
            console.error(error);
        }
    }
}
