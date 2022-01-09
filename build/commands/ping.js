"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modules_1 = require("../modules/modules");
function ping(message, client) {
    message.channel.send('pong')
        .then(msg => (0, modules_1.deleteMsg)(msg, 30000, client));
}
exports.default = ping;
