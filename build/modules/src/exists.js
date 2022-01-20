"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
/**
 * @param  {} id id of the discord server
 * @param  {} str which map you want to check
 * @variation str queue, dci
 */
async function exists(id, str) {
    const file = fs.readFileSync('./config/global.json', 'utf-8');
    const data = JSON.parse(file);
    if (str === 'queue') {
        for (let i = 0; i < data.queues.length; i++) {
            if (data.queues[i].id === id) {
                return Object.assign({}, data.queues[i]);
            }
        }
    }
    if (str === 'dci') {
        for (let i = 0; i < data.disconnectIdles.length; i++) {
            if (data.disconnectIdles[i].id === id) {
                return Object.assign({}, data.disconnectIdles[i]);
            }
        }
    }
    return null;
}
exports.default = exists;
