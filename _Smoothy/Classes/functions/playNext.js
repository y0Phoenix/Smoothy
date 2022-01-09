"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getVideo_1 = require("./getVideo");
const play_1 = require("./play");
/**
 * @param  {any} queue the map that holds all of the serverQueues
 * @param  {any} DisconnectIdle the map that hold all of the Idles
 * @param  {Idle} serverDisconnectIdle the current servers Idle
 * @description searches for the song again to ensure it exists then plays that song at the play function
 * somewhat of a middleware function
 */
async function playNext(queue, DisconnectIdle, serverDisconnectIdle) {
    await (0, getVideo_1.default)(this);
    (0, play_1.default)(this, queue, DisconnectIdle, serverDisconnectIdle);
}
exports.default = playNext;
