const swap = (nums: number[], i: number, j: number) => {
  const temp = nums[i];
  nums[i] = nums[j];
  nums[j] = temp;
};

const partition = (nums: number[], lo: number, hi: number) => {
  const pivot = nums[lo];
  let i = lo + 1,
    j = hi;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    while (i < hi && nums[i] <= pivot) {
      i++;
    }
    while (j > lo && nums[j] > pivot) {
      j--;
    }
    if (i >= j) {
      break;
    }
    swap(nums, i, j);
  }
  swap(nums, lo, j);
  return j;
};

const _sort = (nums: number[], lo: number, hi: number) => {
  if (lo >= hi) return;
  const p = partition(nums, lo, hi);
  _sort(nums, lo, p - 1);
  _sort(nums, p + 1, hi);
};

export const sort = (nums: number[]) => {
  _sort(nums, 0, nums.length - 1);
};
