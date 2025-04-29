export class TransactionBatchWriter {
    constructor(collection, batchSize = 1000, flushIntervalMs = 2000) {
        this.collection = collection;
        this.batchSize = batchSize;
        this.queue = [];
        this.flushIntervalMs = flushIntervalMs;
        this.timer = setInterval(() => this.flush(), this.flushIntervalMs);
    }

    async queueTransaction(doc) {
        this.queue.push(doc);
        if (this.queue.length >= this.batchSize) {
            await this.flush();
        }
    }

    async flush() {
        if (!this.queue.length) return;
        const batch = this.queue;
        this.queue = [];
        try {
            await this.collection.insertMany(batch, { ordered: false });
        } catch (err) {
            console.error("Falha ao inserir no banco de dados:", err);
        }
    }

    async shutdown() {
        clearInterval(this.timer);
        await this.flush();
    }
}