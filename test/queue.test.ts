import { Queue } from '../src/index';

describe('Queue', () => {
  const queue = new Queue<number>();
  
  it('enqueue', () => {
    queue.offer(4);
    queue.offer(3);
    queue.offer(2);
    queue.offer(1);
    expect(queue.toString()).toBe("[ 1 2 3 4 ]");
  })

  it('dequeue', () => {
    queue.poll();
    queue.poll();
    queue.poll();
    queue.poll();
    expect(queue.toString()).toBe("[  ]");
  })
})
