import { Router } from "express";
import { TransactionController } from "../controllers/transactions";

const transactionRouter = Router();


transactionRouter.post('/transactions', TransactionController.create);

export { transactionRouter };