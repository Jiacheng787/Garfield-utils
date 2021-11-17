type Args = unknown[];
type Func = (...args: Args) => unknown;
type Err = unknown;
type Data = unknown;
type Promisify = (func: Func) => (...args: Args) => Promise<unknown>;
