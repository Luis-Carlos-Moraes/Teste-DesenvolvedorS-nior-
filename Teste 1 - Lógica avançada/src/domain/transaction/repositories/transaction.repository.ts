import { Transaction } from '../entities/transaction.entity';

export interface ITransactionRepository {
  insertBatch(batch: Transaction[]): Promise<void>;
}