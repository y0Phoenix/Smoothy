"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @description searches for the song again to ensure it exists then plays that song at the play function
 * somewhat of a middleware function
 */
async function playNext() {
    await this.getVideo();
    this.play();
}
exports.default = playNext;
