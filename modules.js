const { getVoiceConnection } = require("@discordjs/voice");
module.exports =  { 
    async deleteMsg(msg, time, bool, serverQueue) {
        if (bool) {
            serverQueue.nowPlayingTimer = setTimeout( async () => { 
                await msg.delete();
                serverQueue.nowPlaying = undefined;
            }, time);
        }
        else {
            setTimeout( async () => { await msg.delete() }, time);
        }
    }, 
    async leave(q, di, msg) {
        const id = msg.guild.id
        const vc = getVoiceConnection(id);
        const sdi = di.get(id);
        const sq = q.get(id)
        
        if (vc) {
            if (sq) {
                if (sq.nowPlaying) {
                    sq.nowPlaying.delete();
                }
            }
                if (sdi.queueMSGs[0]) {
                    for (let i = 0;
                        i < sdi.queueMSGs.length;
                        i++) {
                            sdi.queueMSGs[i].delete();
                        }
                }
                if (vc) {
                    vc.disconnect()
                }
                if (sq) {
                    q.delete(id);
                }
                if (sdi) {
                    di.delete(id);
                }
        }
    }
}