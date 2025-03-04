import { ITransactionLoader } from '../utils/transaction-loader';
import { ITransactionRepository } from '../repositories/transaction.repository';
import { Transaction } from '../entities/transaction.entity';
import { IHeap } from '../utils/heap';
import { ILogger } from '../utils/logger';

export class ProcessTransactionsUseCase {
  constructor(
    private transactionLoader: ITransactionLoader,
    private transactionRepository: ITransactionRepository,
    private timestampHeap: IHeap<number>,
    private logger: ILogger,
    private batchSize: number = 5000
  ) {}

  async execute(): Promise<void> {
    const window = new Map<number, Transaction[]>();
    const keyToTransactions = new Map<string, Set<Transaction>>();
    const batch: Transaction[] = [];
    const TIME_WINDOW = 10000;
    this.logger.info('Starting transaction processing');

    for await (const transaction of this.transactionLoader.getSortedTransactions()) {
      const transactionMs = new Date(transaction.timestamp).getTime();
      transaction.ms = transactionMs;

      while (this.timestampHeap.size() > 0 && transactionMs - this.timestampHeap.peek()! > TIME_WINDOW) {
        const oldMs = this.timestampHeap.pop()!;
        const oldTransactions = window.get(oldMs)!;
        for (const oldTransaction of oldTransactions) {
          const key = `${oldTransaction.pagador}-${oldTransaction.recebedor}-${oldTransaction.valor}`;
          const transactionsSet = keyToTransactions.get(key)!;
          transactionsSet.delete(oldTransaction);
          if (transactionsSet.size === 0) {
            keyToTransactions.delete(key);
          }
        }
        window.delete(oldMs);
      }

      const key = `${transaction.pagador}-${transaction.recebedor}-${transaction.valor}`;
      let wTransactionsWithSameKey = keyToTransactions.get(key);

      if (!wTransactionsWithSameKey) {
        wTransactionsWithSameKey = new Set();
        keyToTransactions.set(key, wTransactionsWithSameKey);
      }

      let isDuplicate = false;
      for (const wTransaction of wTransactionsWithSameKey) {
        if (Math.abs(wTransaction.ms! - transactionMs) <= TIME_WINDOW) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        wTransactionsWithSameKey.add(transaction);

        if (!window.has(transactionMs)) {
          window.set(transactionMs, []);
          this.timestampHeap.push(transactionMs);
        }
        window.get(transactionMs)!.push(transaction);

        batch.push(transaction);
      }

      if (batch.length >= this.batchSize) {
        await this.transactionRepository.insertBatch(batch);
        this.logger.info(`Inserted batch of ${batch.length} transactions`);
        batch.length = 0;
      }
    }

    if (batch.length > 0) {
      await this.transactionRepository.insertBatch(batch);
      this.logger.info(`Inserted final batch of ${batch.length} transactions`);
    }
    this.logger.info('Transaction processing completed');
  }
}