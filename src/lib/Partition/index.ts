/**
 * 模仿 lodash _.partition 实现
 * @param collection
 * @param predicate
 * @returns
 */
export const partition = <T>(collection: T[], predicate: (item: T) => boolean) =>
  collection.reduce<T[][]>(
    (accu, cur) => {
      // 如果 predicate 返回 true，则 push 到第一个数组中
      // 反之 push 到第二个数组中
      const list = predicate(cur) ? accu[0] : accu[1];
      list.push(cur);
      return accu;
    },
    [[], []]
  );
