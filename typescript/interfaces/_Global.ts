import { Idle } from "../Classes/Idle";
import Queue from "../Classes/Queue";

export default interface Global {
    queues: Queue[],
    disconnectIdles: Idle[];
}