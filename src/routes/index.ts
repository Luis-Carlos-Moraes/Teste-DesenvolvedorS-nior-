import { Router } from 'express';
import { transactionRouter } from './searchTransactions.routes';

const router = Router();
router.use(transactionRouter);

export { router };