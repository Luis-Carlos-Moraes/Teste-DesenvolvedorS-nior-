import fs from 'fs/promises';
import { ITransactionLoader } from '../../domain/transaction/utils/transaction-loader';
import { Transaction } from '../../domain/transaction/entities/transaction.entity';
import { FileSystemError } from '../errors/file-system-error';

export class InMemoryTransactionLoader implements ITransactionLoader {
  constructor(private filePath: string) { }

  async *getSortedTransactions(): AsyncGenerator<Transaction> {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      const transactions: Transaction[] = JSON.parse(data);
      transactions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      for (const transaction of transactions) {
        yield transaction;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new FileSystemError(`Failed to load transactions: ${error.message}`);
      }
      throw new FileSystemError('Failed to load transactions: Unknown error');
    }
  }
}