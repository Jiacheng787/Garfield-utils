import { LinkedList } from './LinkedList';

/**
 * 使用双向链表实现队列
 */
export class Queue<T> extends LinkedList<T> {
  public enqueue(val: T): boolean {
    return this.addFirst(val);
  }

  public dequeue(): T | undefined {
    return this.pollLast();
  }
}
