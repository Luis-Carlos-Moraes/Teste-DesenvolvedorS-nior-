import { Request, Response } from 'express';
import { TransactionService } from '../service/transaction.service';

class TransactionController {
  static async create(request: Request, response: Response) {
    console.log('Recebendo solicitação para criar transação.');
    
    try {
      const { valor, pagador, recebedor } = request.body;

      const transaction = await TransactionService.createTransaction({
        valor,
        pagador,
        recebedor
      });

      response.status(201).json({
        message: 'Transação criada com sucesso',
        transaction,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Erro ao criar transação:', error.message);
        response.status(401).json({ error: error.message });
      } else {
        console.error('Erro desconhecido:', error);
        response.status(500).json({ error: 'Ocorreu um erro desconhecido' });
      }
    }
  }
}

export { TransactionController };