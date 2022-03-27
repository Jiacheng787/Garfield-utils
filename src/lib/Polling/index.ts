import { to } from '../AwaitToJS/index';

type IRequest = (...args: unknown[]) => Promise<unknown>;
type IOptions = {
  timeout: number;
  pollingInterval: number;
};

export class Polling {
  private request: IRequest;
  private options: IOptions;
  private isOnce: boolean;

  constructor(request: IRequest, options: IOptions) {
    this.request = request;
    this.options = options;
    this.isOnce = true;
  }

  sleep() {
    const { timeout = 0, pollingInterval } = this.options;
    return new Promise(resolve =>
      setTimeout(resolve, this.isOnce ? ((this.isOnce = false), timeout) : pollingInterval)
    );
  }

  async onData(callback: (...args: unknown[]) => boolean) {
    // 这里使用一个死循环，而不是 setInterval 或者 setTimeout
    // 注意 async 函数中的死循环并不会阻塞线程，而是由事件循环进行调度
    for (;;) {
      // timeout 确定最小轮询间隔
      // 若接口响应较快，下次轮询也需要等待 timeout 时间
      // 防止接口响应过快导致请求过于频繁
      // 若接口响应较慢，则在响应后直接进行下次轮询
      const [response] = await Promise.all([to(this.request()), this.sleep()]);
      // 回调函数返回布尔值
      // 如果返回 false 就结束轮询
      const res = callback(...response);
      if (!res) {
        break;
      }
    }
  }
}
