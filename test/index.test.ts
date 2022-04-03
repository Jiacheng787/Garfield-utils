import { Polling } from './../src/lib/Polling/index';
const request = (res: unknown) => new Promise(resolve => setTimeout(resolve, 100, res));

let count = 0;
new Polling(() => request("相应内容"), {
  timeout: 0,
  pollingInterval: 3000
})
  .onData((res, err) => {
    console.log("===接口响应", res);
    return ++count < 10;
  })
