import fs from "fs";
import Global from '../../interfaces/_Global'

/**
 * @param  {} id id of the discord server
 * @param  {} str which map you want to check
 * @variation str queue, dci
 */
export default async function exists(id: string, str: string) {
    const file = fs.readFileSync('./config/global.json', 'utf-8');
    const data: Global = JSON.parse(file);
    if (str === 'queue') {
        for (let i = 0;
            i < data.queues.length;
            i++) {
                if (data.queues[i].id === id) {
                    return true;
                }
            }
    }
    if (str === 'dci') {
        for (let i = 0;
            i < data.disconnectIdles.length;
            i++) {
                if (data.disconnectIdles[i].id === id) {
                    return true
                }
            }
    }
    return false
}