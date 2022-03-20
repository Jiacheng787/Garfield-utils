import { ListNode } from './ListNode';

/**
 * 实现双向链表
 */
export class LinkedList<T> {
  private head: ListNode<T> | null = null;
  private end: ListNode<T> | null = null;
  private _size = 0;

  /**
   * add() 相当于 addLast()
   * @param val
   * @returns
   */
  public add(val: T): boolean {
    const node = new ListNode<T>(val);
    if (this.head == null) {
      // 初始化 head 指针
      this.head = node;
    }
    if (this.end == null) {
      // 初始化 end 指针
      this.end = node;
    } else {
      // 把新节点挂到链表最后
      this.end.next = node;
      // 新节点 prev 指向前一节点
      node.prev = this.end;
      // end 指针后移一位
      this.end = node;
    }
    // 维护 size
    this._size++;
    return true;
  }

  /**
   * addFirst() 在链表头部添加
   * @param val
   * @returns
   */
  public addFirst(val: T): boolean {
    const node = new ListNode<T>(val);
    if (this.head == null) {
      // 初始化 head 指针
      this.head = node;
    } else {
      // 把新节点挂到链表头部
      this.head.prev = node;
      // 新节点 next 指向下一节点
      node.next = this.head;
      // head 指针前移一位
      this.head = node;
    }
    if (this.end == null) {
      // 初始化 end 指针
      this.end = node;
    }
    // 维护 size
    this._size++;
    return true;
  }

  /**
   * poll() 相当于 pollFirst()
   * @returns
   */
  public poll(): T | undefined {
    if (this._size == 0) return;
    // 缓存需要删除的节点
    const node = this.head;
    if (this._size == 1) {
      this.head = null;
      this.end = null;
    } else {
      // head 指向下一节点
      this.head = (this.head as ListNode<T>).next;
      // 切断与前一节点的联系
      (this.head as ListNode<T>).prev = null;
    }
    // 维护 size
    this._size--;
    return (node as ListNode<T>).val;
  }

  /**
   * pollLast() 移除链表尾部元素
   * @returns
   */
  public pollLast(): T | undefined {
    if (this._size == 0) return;
    // 缓存需要删除的节点
    const node = this.end;
    if (this._size == 1) {
      this.head = null;
      this.end = null;
    } else {
      // end 指向前一节点
      this.end = (this.end as ListNode<T>).prev;
      // 切断与后一节点的联系
      (this.end as ListNode<T>).next = null;
    }
    // 维护 size
    this._size--;
    return (node as ListNode<T>).val;
  }

  /**
   * 获取链表长度
   * @returns
   */
  public size(): number {
    return this._size;
  }

  /**
   * 序列化为字符串
   * @returns
   */
  public toString(): string {
    const res: T[] = [];
    let list = this.head;
    while (list != null) {
      res.push(list.val);
      list = list.next;
    }
    return `[${res.join(', ')}]`;
  }
}
