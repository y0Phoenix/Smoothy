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
const fs_1 = __importDefault(require("fs"));
/**
 * @param  {} id id of the discord server
 * @param  {} str which map you want to check
 * @variation str queue, dci
 */
function exists(id, str) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
exports.default = exists;
