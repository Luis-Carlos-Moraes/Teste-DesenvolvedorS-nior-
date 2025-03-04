import { config } from './config';
import { DatabaseConnection } from '../infra/database/postgres/setup/database-connection';
import { TransactionRepository } from '../infra/database/postgres/repositories/transaction.repository';
import { InMemoryTransactionLoader } from '../infra/file/in-memory-transaction-loader';
import { ChunkedTransactionLoader } from '../infra/file/chunk-transaction-loader';
import { ProcessTransactionsUseCase } from '../domain/transaction/usecases/process-transactions.usecase';
import { Logger } from '../infra/logger/logger';
import { HeapImpl } from '../infra/utils/adapters/heap-js';
import fs from 'fs';
import { Transaction } from '../domain/transaction/entities/transaction.entity';
import { DatabaseError } from '../infra/errors/database-error';
import { FileSystemError } from '../infra/errors/file-system-error';

const logger = new Logger(process.env.LOG_LEVEL || 'info');

async function main() {
  const start = performance.now();
  const fileSize = fs.statSync(config.filePath).size;
  const dbConnection = new DatabaseConnection(config.database);
  try {
    await dbConnection.connect();
    const pool = dbConnection.getPool();
    const transactionRepository = new TransactionRepository(pool);

    let transactionLoader;

    if (fileSize <= config.availableMemory) {
      transactionLoader = new InMemoryTransactionLoader(config.filePath);
      logger.info('Using in-memory transaction loader');
    } else {
      const heap = new HeapImpl<{ transaction: Transaction; iterator: AsyncIterator<string> }>(
        (a, b) => a.transaction.ms! - b.transaction.ms!
      );
      transactionLoader = new ChunkedTransactionLoader(config.filePath, config.chunkSize, heap, logger);
      logger.info('Using chunked transaction loader');
    }
    const timestampHeap = new HeapImpl<number>((a, b) => a - b);
    const processTransactionsUseCase = new ProcessTransactionsUseCase(
      transactionLoader,
      transactionRepository,
      timestampHeap,
      logger,
      config.batchSize
    );

    await processTransactionsUseCase.execute();
    logger.info(`Processing completed in ${performance.now() - start} ms`);
  } catch (error) {
    if (error instanceof DatabaseError) {
      logger.error('Database error: %s', error.message);
    } else if (error instanceof FileSystemError) {
      logger.error('File system error: %s', error.message);
    } else if (error instanceof Error) {
      logger.error('Unexpected error: %s', error.message);
    }
    throw error;
  } finally {
    await dbConnection.close();
  }
}

main().catch((error) => {
  logger.error('Unhandled error: %s', error instanceof Error ? error.message : String(error));
  process.exit(1);
});