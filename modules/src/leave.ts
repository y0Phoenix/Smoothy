import {getVoiceConnection} from '@discordjs/voice';
import {writeGlobal} from './writeglobal';

interface Queue {
    [key: string], 
    [value: Object]
}

interface DisconnectIdle {

}

interface Message {
    guildId: string,
}

/**
 * @param  {} queue the queue map for songs 
 * @param  {} DisconnectIdle the map for idle timer and message arrays
 * @param  {} message any message object from the discord server needed for GuidId
 */
 async function leave(q: Queue , di: DisconnectIdle, msg: Message) {
    const id = msg.guildId
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
                    if (!sdi.msgs[i].content) {
                        const channel = await sdi.client.channels.fetch(sdi.message.channelId);
                        const message = await channel.messages.fetch(sdi.msgs[i].id);
                        message.delete();
                    }
                    else {
                        sdi.msgs[i].delete();
                    }
                }
        }
        if (sdi.queueMsgs[0]) {
            for (let i = 0;
                i < sdi.queueMsgs.length;
                i++) {
                    if (!sdi.queueMsgs[i].content) {
                        const channel = await sdi.client.channels.fetch(sdi.message.channelId);
                        const message = await channel.messages.fetch(sdi.queueMsgs[i].id);
                        message.delete();
                    }
                    else {
                        sdi.queueMsgs[i].delete();
                    }
                }
        }
        if (vc) {
            vc.disconnect()
        }
        if (sq) {
            q.delete(id);
            await writeGlobal('delete queue', null, id);
        }
        if (sdi) {
            di.delete(id);
            await writeGlobal('delete dci', null, id);
        }

    }
}