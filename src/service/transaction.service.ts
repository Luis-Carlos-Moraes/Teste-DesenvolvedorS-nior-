import { TransactionData } from '../interface/ITransaction';
import Transaction from '../database/models/TransactionModel';
import { TransactionValidator } from '../validators/transaction.validator';

export class TransactionService {
  private static queue: TransactionData[] = [];

  static async createTransaction(transactionData: Omit<TransactionData, 'timestamp' | 'createdAt'>): Promise<Transaction> {
    const { valor, pagador, recebedor } = transactionData;

    // Validações
    TransactionValidator.validateParticipants(pagador, recebedor);
    await TransactionValidator.validateDuplicateTransaction(valor, pagador, recebedor);

    // Criar transação
    const completeTransactionData: TransactionData = {
      ...transactionData,
      timestamp: new Date(),
      createdAt: new Date(),
    };

    this.queue.push(completeTransactionData);
    return await Transaction.create(completeTransactionData as any);
  }

  static getQueue(): TransactionData[] {
    return this.queue;
  }
}

