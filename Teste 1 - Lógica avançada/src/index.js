import { DatabaseService } from "./DatabaseService.js";
import { Deduplicator } from "./Deduplicator.js";
import { TransactionBatchWriter } from "./TransactionBatchWriter.js";
import { TransactionProcessor } from "./TransactionProcessor.js";

const FILE_PATH = "../transacoes1k.json";
const DUPLICATE_DETECTION_WINDOW_MS  = 10_000;
const MONGODB_URL = "mongodb://localhost:27017";
const DATABASE_NAME = "teste_logic";
const COLLECTION_NAME = "transacoes";

async function main() {
    const dbService = new DatabaseService(MONGODB_URL, DATABASE_NAME, COLLECTION_NAME);
    await dbService.connect();
    await dbService.createIndex();

    const deduplicator = new Deduplicator(DUPLICATE_DETECTION_WINDOW_MS );
    const batchWriter = new TransactionBatchWriter(dbService.collection);

    const processor = new TransactionProcessor({
        filePath: FILE_PATH,
        deduplicator,
        batchWriter
    });

    try {
        await processor.run();
    } finally {
        await dbService.close();
    }
}

main().catch(err => {
    console.error("Erro ao realizar processamento: ", err);
    process.exit(1);
});
