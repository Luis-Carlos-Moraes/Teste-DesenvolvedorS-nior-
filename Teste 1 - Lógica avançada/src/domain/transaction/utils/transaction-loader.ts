import { Transaction } from '../entities/transaction.entity';

export interface ITransactionLoader {
  getSortedTransactions(): AsyncGenerator<Transaction>;
}