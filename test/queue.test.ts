import { Queue } from '../src/index';

describe('Queue', () => {
  const queue = new Queue<number>();
  
  it('enqueue', () => {
    queue.enqueue(4);
    queue.enqueue(3);
    queue.enqueue(2);
    queue.enqueue(1);
    expect(queue.toString()).toBe("[ 1 2 3 4 ]");
  })

  it('dequeue', () => {
    queue.dequeue();
    queue.dequeue();
    queue.dequeue();
    queue.dequeue();
    expect(queue.toString()).toBe("[  ]");
  })
})
