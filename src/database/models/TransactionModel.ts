import { Table, Column, Model, PrimaryKey, AutoIncrement, DataType } from 'sequelize-typescript';
import { TransactionData } from '../../interface/ITransaction';


@Table({ tableName: 'transactions', timestamps: false }) // desativa createdAt/updatedAt automáticos
export class Transaction extends Model<TransactionData> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.DECIMAL)
  valor!: number;

  @Column(DataType.BIGINT)
  pagador!: number;

  @Column(DataType.BIGINT)
  recebedor!: number;

  @Column(DataType.DATE)
  timestamp!: Date;

  @Column(DataType.DATE)
  createdAt!: Date;
}

export default Transaction;