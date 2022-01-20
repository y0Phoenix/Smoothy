"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queue = new Map();
const DisconnectIdle = new Map();
/**
 * @returns the maps inside the main file
 */
function getMaps() {
    return { queue: queue, DisconnectIdle: DisconnectIdle };
}
exports.default = getMaps;
