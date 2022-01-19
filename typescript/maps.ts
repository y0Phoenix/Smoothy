const queue = new Map();
const DisconnectIdle = new Map();
/**
 * @returns the maps inside the main file
 */
export default function getMaps() {
    return {queue: queue, DisconnectIdle: DisconnectIdle};
}