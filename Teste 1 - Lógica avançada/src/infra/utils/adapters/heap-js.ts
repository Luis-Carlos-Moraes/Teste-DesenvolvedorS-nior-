import { Heap } from 'heap-js';
import { IHeap } from '../../../domain/transaction/utils/heap';

export class HeapImpl<T> implements IHeap<T> {
  private heap: Heap<T>;

  constructor(comparator: (a: T, b: T) => number) {
    this.heap = new Heap(comparator);
  }

  push(item: T): void {
    this.heap.push(item);
  }

  pop(): T | undefined {
    return this.heap.pop();
  }

  peek(): T | undefined {
    return this.heap.peek();
  }

  size(): number {
    return this.heap.size();
  }
}