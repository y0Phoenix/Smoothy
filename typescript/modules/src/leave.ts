import {getVoiceConnection} from '@discordjs/voice';
import { Message, Client } from 'discord.js';
import { Idle } from '../../Classes/Idle';
import Queue from '../../Classes/Queue';
import deleteMsg from './deleteMsg';
import writeGlobal from './writeglobal';

/**
 * @param  {} queue the queue map for songs 
 * @param  {} DisconnectIdle the map for idle timer and message arrays
 * @param  {} message any message object from the discord server needed for GuidId
 */
export default async function leave(msg: Message, DisconnectIdle: any, queue: any) {
    const id = msg.guild.id
    const vc = getVoiceConnection(id);
    const sdi: Idle = DisconnectIdle.get(id);
    const sq: Queue = queue.get(id);
    const client: Client = DisconnectIdle.get(1);
    
    if (vc) {
        if (sq) {
            if (sq.nowPlaying) {
                deleteMsg(sq.nowPlaying, 0, client);
            }
        }
        sdi.msgs.forEach(msg => {
            deleteMsg(msg, 0, client);
        })
        sdi.queueMsgs.forEach(msg => {
            deleteMsg(msg, 0, client);
        })
        if (vc) {
            vc.disconnect()
        }
        if (sq) {
            queue.delete(id);
            await writeGlobal('delete queue', null, id);
        }
        if (sdi) {
            DisconnectIdle.delete(id);
            await writeGlobal('delete dci', null, id);
        }

    }
}