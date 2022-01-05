"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryTimer = exports.checkIfPlaying = void 0;
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const modules_1 = require("../../modules/modules");
const getVideo_1 = __importDefault(require("./getVideo"));
const embed_1 = __importDefault(require("../../functions/embed"));
const play_1 = __importDefault(require("./play"));
/**
 * @param  {Queue} serverQueue the current servers queue
 * @description checks if the serverQueue is playing a song via
 * AudioPlayerStatus
 * @returns {boolean} boolean value
 */
function checkIfPlaying(serverQueue) {
    return __awaiter(this, void 0, void 0, function* () {
        if (serverQueue.player.state.status === voice_1.AudioPlayerStatus.Playing) {
            return true;
        }
        else {
            return false;
        }
    });
}
exports.checkIfPlaying = checkIfPlaying;
/**
 * @param  {Queue} serverQueue the currents servers queue
 * @param  {any} queue the map that holds all of the server queues
 * @param  {any} DisconnectIdle the map that holds all of the server Idles
 * @param  {Idle} serverDisconnectIdle the current servers Idle
 */
function retryTimer(serverQueue, queue, DisconnectIdle, serverDisconnectIdle) {
    return __awaiter(this, void 0, void 0, function* () {
        if (serverQueue.player.state.status !== voice_1.AudioPlayerStatus.Playing && serverQueue.tries < 5 && serverQueue.loop === false) {
            if (serverQueue.jumpbool === true) {
                const result = yield (0, modules_1.find)(serverQueue, serverQueue.currentsong[0].title);
                if (result !== null) {
                    if (result.shuffledSong !== null) {
                        serverQueue.jump = result.shuffledSong;
                    }
                    else {
                        serverQueue.jump = result.song;
                    }
                }
                else {
                    const errorEmbed = new discord_js_1.MessageEmbed()
                        .setColor('RED')
                        .setDescription(`:thumbsdown: [${serverQueue.currentsong[0].title}](${serverQueue.currentsong[0].url}) failed to play reverting to original queue try again later`);
                    (0, embed_1.default)(serverQueue.message, errorEmbed, 60000);
                }
            }
            serverQueue.currentsong.shift();
            yield (0, getVideo_1.default)(serverQueue);
            console.log(`Retrying ${serverQueue.currentsong[0].title} at ${serverQueue.currentsong[0].url}`);
            (0, play_1.default)(serverQueue, queue, DisconnectIdle, serverDisconnectIdle);
            if (serverQueue.tries >= 4) {
                serverQueue.message.channel
                    .send(`Smoothy Is Buffering Please Wait`)
                    .then((msg) => (0, modules_1.deleteMsg)(msg, 30000));
            }
        }
    });
}
exports.retryTimer = retryTimer;
