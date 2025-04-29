import fs from "fs";
import { pipeline } from "stream/promises";
import { Writable } from "stream";
import JSONStream from "JSONStream";

export class TransactionProcessor {
    constructor({ filePath, deduplicator, batchWriter }) {
        this.filePath = filePath;
        this.deduplicator = deduplicator;
        this.batchWriter = batchWriter;
    }

    async run() {
        const startTime = Date.now();
        const fileStream = fs.createReadStream(this.filePath);
        const parser = JSONStream.parse("*");

        const deduplicator = this.deduplicator;
        const batchWriter = this.batchWriter;

        const writer = new Writable({
            objectMode: true,
            write: async (chunk, enconding, next) => {
                try {
                    if (!deduplicator.isDuplicate(chunk)) {
                        await batchWriter.queueTransaction({
                            pagador: chunk.pagador,
                            recebedor: chunk.recebedor,
                            valor: chunk.valor,
                            timestamp: new Date(chunk.timestamp),
                        });
                    }
                } catch (err) {
                    console.error("Erro ao processar registro: ", err);
                }
                next();
            }
        });

        await pipeline(fileStream, parser, writer);
        await batchWriter.shutdown();
        const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`Tempo de duração: ${durationSec}s`);
    }
}