type AwaitTo = <T>(p: Promise<T>) => Promise<(T | null)[] | [null, unknown]>;

const to: AwaitTo = p =>
  Promise.resolve(p)
    .then(res => {
      return [res, null];
    })
    .catch(err => {
      return [null, err];
    });

type IRequest = (...args: unknown[]) => Promise<unknown>;

class Polling {
  private request: IRequest;
  private timeout: number;

  constructor(
    request: IRequest,
    timeout: number
  ) {
    this.request = request;
    this.timeout = timeout;
  }

  sleep() {
    return new Promise(resolve => setTimeout(resolve, this.timeout));
  }

  async onData(callback: (...args: unknown[]) => boolean) {
    // 这里使用一个死循环，而不是 setInterval 或者 setTimeout
    // 注意 async 函数中的死循环并不会阻塞线程，而是由事件循环进行调度
    for (;;) {
      // timeout 确定最小轮询间隔
      // 若接口响应较快，下次轮询也需要等待 timeout 时间
      // 防止接口响应过快导致请求过于频繁
      // 若接口响应较慢，则在响应后直接进行下次轮询
      const [response] = await Promise.all([
        to(this.request()),
        this.sleep()
      ])
      // 回调函数返回布尔值
      // 如果返回 false 就结束轮询
      const res = callback(...response);
      if (!res) {
        break;
      }
    }
  }
}

const request = (res: unknown) => new Promise(resolve => setTimeout(resolve, 100, res));

let count = 0;
new Polling(() => request("相应内容"), 1000)
  .onData((res, err) => {
    console.log("===接口响应", res);
    return ++count !== 10;
  })
