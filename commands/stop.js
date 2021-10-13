const executive = require('./executive');
var {AudioPlayerStatus,
    } = require('@discordjs/voice');
module.exports = {
    name: 'stop',
    description: 'stops playing and clears the queue',
    async stop(message, queue, serverQueue) {
        voiceChannel = message.member.voice.channel;
        if (serverQueue.player.state.status === AudioPlayerStatus.Playing){
            serverQueue.player.stop();
            queue.delete(message.guild.id)
            message.reply(':octagonal_sign: I Have ***Stopped*** The Music :octagonal_sign:!');
        }else
            message.reply(':rofl: Nothing ***Playing*** Currently :rofl:!')
    }
}