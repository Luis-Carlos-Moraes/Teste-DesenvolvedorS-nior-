import { ITransactionLoader } from '../../domain/transaction/utils/transaction-loader';
import { Transaction } from '../../domain/transaction/entities/transaction.entity';
import { Worker } from 'worker_threads';
import path from 'path';
import { splitIntoChunks } from './split-into-chunks';
import { mergeSortedChunks } from './merge-sorted-chunks';
import fs from 'fs';
import { IHeap } from '../../domain/transaction/utils/heap';
import { ILogger } from '../../domain/transaction/utils/logger';

export class ChunkedTransactionLoader implements ITransactionLoader {
  private chunkPaths: string[] = [];

  constructor(
    private filePath: string,
    private chunkSize: number = 500000,
    private heap: IHeap<{ transaction: Transaction; iterator: AsyncIterator<string> }>,
    private logger: ILogger
  ) { }

  private async prepareChunks(): Promise<void> {
    this.logger.info(`Splitting file into chunks of size ${this.chunkSize}`);
    this.chunkPaths = await splitIntoChunks(this.filePath, this.chunkSize);
    this.logger.info(`Created ${this.chunkPaths.length} chunks`);
    const sortPromises = this.chunkPaths.map(chunkPath => this.sortChunk(chunkPath));
    await Promise.all(sortPromises);
    this.logger.info(`All chunks sorted`);
  }

  private sortChunk(chunkPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, 'sort-chunk-worker.js'), { workerData: chunkPath });
      worker.on('message', (message) => {
        if (message === 'Chunk sorted') resolve();
        else reject(new Error(message));
      });
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  }

  async *getSortedTransactions(): AsyncGenerator<Transaction> {
    await this.prepareChunks();
    for await (const transaction of mergeSortedChunks(this.chunkPaths, this.heap)) {
      yield transaction;
    }
    this.chunkPaths.forEach(chunkPath => fs.unlinkSync(chunkPath));
  }
}