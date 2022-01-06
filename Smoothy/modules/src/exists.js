"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
/**
 * @param  {} id id of the discord server
 * @param  {} str which map you want to check
 * @variation str queue, dci
 */
async function exists(id, str) {
    const file = fs_1.default.readFileSync('./config/global.json', 'utf-8');
    const data = JSON.parse(file);
    if (str === 'queue') {
        for (let i = 0; i < data.queues.length; i++) {
            if (data.queues[i].id === id) {
                return true;
            }
        }
    }
    if (str === 'dci') {
        for (let i = 0; i < data.disconnectIdles.length; i++) {
            if (data.disconnectIdles[i].id === id) {
                return true;
            }
        }
    }
    return false;
}
exports.default = exists;
