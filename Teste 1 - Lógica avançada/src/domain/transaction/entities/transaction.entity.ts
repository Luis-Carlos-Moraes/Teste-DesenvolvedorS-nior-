export class Transaction {
  constructor(
    public id: string,
    public valor: number,
    public pagador: string,
    public recebedor: string,
    public timestamp: string,
    public ms?: number
  ) { }
}