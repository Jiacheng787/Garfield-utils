import { sort } from './../src/lib/Quick/index';
const arr = Array.from({ length: 10 }, () => Math.floor(Math.random() * 1000));
console.log(arr);
sort(arr);
console.log(arr);
