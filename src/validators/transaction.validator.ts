import { Op } from 'sequelize';
import Transaction from '../database/models/TransactionModel';

export class TransactionValidator {
  static async validateDuplicateTransaction(
    valor: number,
    pagador: string,
    recebedor: string
  ): Promise<void> {
    const lastTransaction = await Transaction.findOne({
      where: {
        valor,
        pagador,
        recebedor,
        createdAt: { [Op.gt]: new Date(new Date().getTime() - 10000) }
      },
      order: [['createdAt', 'DESC']],
    });

    if (lastTransaction) {
      throw new Error(
        'Essa transação já foi feita recentemente. Por favor, aguarde antes de tentar novamente.'
      );
    }
  }

  static validateParticipants(pagador: string, recebedor: string): void {
    if (pagador === recebedor) {
      throw new Error('O pagador e o recebedor devem ser pessoas diferentes.');
    }
  }
}
