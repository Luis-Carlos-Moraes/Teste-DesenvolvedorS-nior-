import fs from 'fs';
import readline from 'readline';
import { Transaction } from '../../domain/transaction/entities/transaction.entity';
import { IHeap } from '../../domain/transaction/utils/heap';

export async function* mergeSortedChunks(
  chunkPaths: string[],
  heap: IHeap<{ transaction: Transaction; iterator: AsyncIterator<string> }>
): AsyncGenerator<Transaction> {
  const readers = chunkPaths.map(chunkPath =>
    readline.createInterface({
      input: fs.createReadStream(chunkPath),
      crlfDelay: Infinity,
    })
  );

  const iterators = readers.map(reader => reader[Symbol.asyncIterator]());
  const currentTransactions = await Promise.all(
    iterators.map(async it => {
      const { value } = await it.next();
      if (value) {
        const transaction: Transaction = JSON.parse(value);
        transaction.ms = new Date(transaction.timestamp).getTime();
        return { transaction, iterator: it };
      }
      return null;
    })
  );

  currentTransactions.forEach((item, index) => {
    if (item) heap.push({ transaction: item.transaction, iterator: iterators[index] });
  });

  while (heap.size()) {
    const { transaction, iterator } = heap.pop()!;
    yield transaction;

    const { value } = await iterator.next();
    if (value) {
      const nextTransaction: Transaction = JSON.parse(value);
      nextTransaction.ms = new Date(nextTransaction.timestamp).getTime();
      heap.push({ transaction: nextTransaction, iterator });
    }
  }
}