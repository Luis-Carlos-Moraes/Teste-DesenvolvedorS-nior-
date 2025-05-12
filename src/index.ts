import express from "express";
import { router } from "./routes/index";
import "reflect-metadata";
import { startServer } from "./database/index";
import 'dotenv/config';

const app = express();

app.use(express.json());
app.use(router);

let port = process.env.APP_PORT || 3333;

app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
  startServer();
});