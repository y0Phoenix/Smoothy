import { WriteIdle } from "../Classes/Idle";
import WriteQueue from "../Classes/WriteQueue";

export default interface Global {
    queues: WriteQueue[],
    disconnectIdles: WriteIdle[];
}