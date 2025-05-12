export interface TransactionData {
  valor: number;
  pagador: string;
  recebedor: string;
  timestamp?: Date;
  createdAt?: Date;
}