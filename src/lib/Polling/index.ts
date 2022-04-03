import { to } from '../AwaitToJS/index';

type IRequest = (...args: unknown[]) => Promise<unknown>;
type IOptions = {
  timeout: number;
  pollingInterval: number;
};

/**
 * 一个轮询调度器
 */
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
    // 注意这里使用了逗号表达式
    return new Promise(resolve =>
      setTimeout(resolve, this.isOnce ? ((this.isOnce = false), timeout) : pollingInterval)
    );
  }

  async onData(callback: (...args: unknown[]) => boolean) {
    // 这里使用一个死循环，而不是 setInterval 或者 setTimeout
    // 注意 async 函数中的死循环并不会阻塞线程，而是由事件循环进行调度
    for (;;) {
      // pollingInterval 确定最小轮询间隔
      // 若接口响应较快，下次轮询也需要等待 pollingInterval 时间
      // 防止接口响应过快导致请求过于频繁
      // 若接口响应较慢，则在响应后直接进行下次轮询

      // 这里的灵感来自 Promise.race() 处理请求超时逻辑
      // 这里跟请求超时逻辑恰好相反，不是比谁快，而是等待最慢的 Promise resolve

      // 由于 Promise.all() 要求 Promise 都是 resolve 状态
      // 因此使用 await-to-js 优雅异常处理
      // 注意左边解构数组拿到的 response 仍是一个数组 [res, null]
      const [response] = await Promise.all([to(this.request()), this.sleep()]);

      // 回调函数返回布尔值
      // 如果返回 true 就结束轮询

      // 注意 response 是一个数组
      // 展开后第一个参数是成功结果，第二个参数是异常结果
      const res = callback(...response);
      if (res) {
        break;
      }
    }
  }
}
