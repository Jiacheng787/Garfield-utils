type IMiddleware<T> = (arg0: T, ...args: unknown[]) => T;
type ICompose = <T>(
  middlewares: IMiddleware<T>[]
) => (...extraArgs: unknown[]) => (initialValue: T) => T;

export const compose: ICompose =
  middlewares =>
  (...extraArgs) =>
  initialValue =>
    middlewares.reduce((accu, cur) => cur(accu, ...extraArgs), initialValue);
