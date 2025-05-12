import { Sequelize } from 'sequelize-typescript';
import { Transaction } from './models/TransactionModel';
import 'dotenv/config';

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  logging: false,
  models: [Transaction],
});

export async function startServer() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

  } catch (error) {
    console.error("❌ Erro na conexão com o banco:", error);
  }
}

startServer();