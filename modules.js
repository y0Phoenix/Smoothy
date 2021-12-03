const { getVoiceConnection } = require("@discordjs/voice");
module.exports =  { 
    async deleteMsg(msg, time, bool) {
        if (bool) {
        
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
                if (sdi.msgs[0]) {
                    for (let i = 0;
                        i < sdi.msgs.length;
                        i++) {
                            sdi.msgs[i].delete();
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