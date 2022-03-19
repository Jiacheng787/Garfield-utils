type Args = unknown[];
type Func = (...args: Args) => unknown;
type Err = unknown;
type Data = unknown;
type Promisify = (func: Func) => (...args: Args) => Promise<unknown>;

export const promisify: Promisify =
  func =>
  (...args) =>
    new Promise((resolve, reject) => {
      func(...args, (err: Err, data: Data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
