import { LinkedList } from './LinkedList';

/**
 * 使用双向链表实现队列
 */
export class Queue<T> extends LinkedList<T> {
  public offer(val: T): boolean {
    return this.addFirst(val);
  }

  public poll(): T | undefined {
    return this.pollLast();
  }
}
