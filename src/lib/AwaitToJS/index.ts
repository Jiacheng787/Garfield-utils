type AwaitTo = <T>(p: Promise<T>) => Promise<(T | null)[] | [null, unknown]>;

export const to: AwaitTo = p =>
  Promise.resolve(p)
    .then(res => {
      return [res, null];
    })
    .catch(err => {
      return [null, err];
    });
