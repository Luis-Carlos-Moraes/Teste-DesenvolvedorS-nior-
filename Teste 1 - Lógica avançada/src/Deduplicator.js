export class Deduplicator {
    constructor(windowMs) {
        this.windowMs = windowMs;
        this.memoryMap = new Map();
    }

    isDuplicate({ pagador, recebedor, valor, timestamp }) {
        const key = `${pagador}-${recebedor}-${valor}`;
        const timestampMs = new Date(timestamp).getTime();
        const windowMin = timestampMs - this.windowMs;

        const inMemory = (this.memoryMap.get(key) || [])
            .filter(transaction => transaction >= windowMin);

        if (inMemory.some(transaction => Math.abs(transaction - timestampMs) <= this.windowMs)) {
            this.memoryMap.set(key, inMemory);
            return true;
        }

        inMemory.push(timestampMs);
        this.memoryMap.set(key, inMemory);
        return false;
    }
}