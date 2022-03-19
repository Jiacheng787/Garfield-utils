/**
 * 链表节点
 */
export class ListNode<T> {
  public next: ListNode<T> | null = null;
  public prev: ListNode<T> | null = null;
  public val: T;

  constructor(val: T) {
    this.val = val;
  }
}
