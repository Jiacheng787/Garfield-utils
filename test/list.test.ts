import { LinkedList } from "../src/index";

describe('LinkedList', () => {
  it('add', () => {
    const list = new LinkedList<number>();
    list.add(1);
    list.add(2);
    list.add(3);
    list.add(4);
    expect(list.toString()).toBe("[ 1 2 3 4 ]");
  })

  it('addFirst', () => {
    const list = new LinkedList<number>();
    list.addFirst(4);
    list.addFirst(3);
    list.addFirst(2);
    list.addFirst(1);
    expect(list.toString()).toBe("[ 1 2 3 4 ]");
  })

  it('poll', () => {
    const list = new LinkedList<number>();
    list.addFirst(4);
    list.addFirst(3);
    list.addFirst(2);
    list.addFirst(1);
    expect(list.poll()).toBe(1);
  })

  it('pollLast', () => {
    const list = new LinkedList<number>();
    list.addFirst(4);
    list.addFirst(3);
    list.addFirst(2);
    list.addFirst(1);
    expect(list.pollLast()).toBe(4);
  })
})
