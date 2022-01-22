"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Idle_1 = require("../../Classes/Idle");
const WriteQueue_1 = require("../../Classes/WriteQueue");
/**
 * @param  {} str a string of what needs to happen
 * @variation str
 * add dci,
 * add queue,
 * update queue,
 * update dci,
 * delete queue,
 * delete dci
 * @param  {} data the data you need to write to the file
 * @param {} id the id of the discord server
 */
async function writeGlobal(str, data, id) {
    const file = './config/global.json';
    let _file = fs.readFileSync(file, 'utf-8');
    let _data = JSON.parse(_file);
    let Data = Object.assign({}, _data);
    var d;
    var q;
    const dciGet = async () => {
        for (let i = 0; i < Data.disconnectIdles.length; i++) {
            if (Data.disconnectIdles[i].id === id) {
                const j = Data.disconnectIdles.map(entry => entry.id).indexOf(id);
                return j;
            }
        }
        return null;
    };
    const queueGet = async () => {
        for (let i = 0; i < Data.queues.length; i++) {
            if (Data.queues[i].id === id) {
                const j = Data.queues.map(entry => entry.id).indexOf(id);
                return j;
            }
        }
        return null;
    };
    if (id !== null) {
        d = await dciGet();
        q = await queueGet();
    }
    if (str === 'add dci') {
        const obj = new Idle_1.WriteIdle({ message: data.message, client: data.client, msgs: data.msgs, queueMsgs: data.queueMsgs });
        Data.disconnectIdles.push(obj);
    }
    if (str === 'add queue') {
        const obj = new WriteQueue_1.default(data);
        Data.queues.push(obj);
    }
    if (str === 'update queue') {
        const obj = new WriteQueue_1.default(data);
        Data.queues[q] = Object.assign({}, obj);
    }
    if (str === 'update dci') {
        const obj = new Idle_1.WriteIdle({ message: data.message, client: data.client, msgs: data.msgs, queueMsgs: data.queueMsgs });
        Data.disconnectIdles[d] = Object.assign({}, obj);
    }
    if (str === 'delete queue') {
        if (q == null) {
            return;
        }
        Data.queues.splice(q, 1);
    }
    if (str === 'delete dci') {
        if (d == null) {
            return;
        }
        Data.disconnectIdles.splice(d, 1);
    }
    const writeData = JSON.stringify(Data);
    fs.writeFileSync(file, writeData);
}
exports.default = writeGlobal;
