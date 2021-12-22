const { getVoiceConnection } = require("@discordjs/voice");

const distance = (name = '', possibleVid = '') => {
    const track = Array(possibleVid.length + 1)
      .fill(null)
      .map(() => Array(name.length + 1).fill(null));
    for (let i = 0; i <= name.length; i += 1) {
      track[0][i] = i;
    }
    for (let j = 0; j <= possibleVid.length; j += 1) {
      track[j][0] = j;
    }
    for (let j = 1; j <= possibleVid.length; j += 1) {
      for (let i = 1; i <= name.length; i += 1) {
        const indicator = name[i - 1] === possibleVid[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator
        );
      }
    }
    return track[possibleVid.length][name.length];
}

const topResult = (arr) => {
    let v = 0;
    let j = 0;
    for (i = 0;
        i < arr.length;
        i++) {
            if (v === 0) {
                v = arr[i].dif;
                j = i;
            }  
            else {
                if (v > arr[i].dif) {
                    v = arr[i].dif;
                    j = i;
                }
        }
    }
    return arr[j].song.title;
}

async function deleteMsg(msg, time, bool) {
    if (bool) {
    
    }
    else {
        setTimeout( async () => { await msg.delete() }, time);
    }
}


async function leave(q, di, msg) {
    const id = msg.guild.id
    const vc = getVoiceConnection(id);
    const sdi = di.get(id);
    const sq = q.get(id);
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
        if (sdi.queueMsgs[0]) {
            for (let i = 0;
                i < sdi.queueMsgs.length;
                i++) {
                    sdi.queueMsgs[i].delete();
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

module.exports =  { deleteMsg, leave, distance, topResult };