import { Pool } from 'pg';
import { ITransactionRepository } from '../../../../domain/transaction/repositories/transaction.repository';
import { Transaction } from '../../../../domain/transaction/entities/transaction.entity';
import { DatabaseError } from '../../../errors/database-error';

export class TransactionRepository implements ITransactionRepository {
  constructor(private pool: Pool) { }

  async insertBatch(batch: Transaction[]): Promise<void> {
    if (batch.length === 0) return;

    const client = await this.pool.connect();
    try {
      const values = batch
        .map(t => `('${t.id}', ${t.valor}, '${t.pagador}', '${t.recebedor}', '${t.timestamp}')`)
        .join(',');
      await client.query(`INSERT INTO transacoes (id, valor, pagador, recebedor, timestamp) VALUES ${values}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to insert batch: ${error.message}`);
      }
      throw new DatabaseError('Failed to insert batch: Unknown error');

    } finally {
      client.release();
    }
  }
}