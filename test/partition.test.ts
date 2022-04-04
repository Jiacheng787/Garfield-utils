import { partition } from './../src/index';

describe("partition", () => {
  it("number 1", () => {
    const collection = [1, 2, 3, 4, 5, 6];
    const res = partition(collection, n => n > 4)
    expect(res).toEqual([[5, 6], [1, 2, 3, 4]]);
  })

  it("number 2", () => {
    const collection = [1, 1, 2, 3, 5, 6];
    const res = partition(collection, n => n > 4)
    expect(res).toEqual([[5, 6], [1, 1, 2, 3]]);
  })

  it("string 1", () => {
    const collection = "abba".split("");
    const res = partition(collection, s => s === 'a');
    expect(res).toEqual([["a", "a"], ["b", "b"]]);
  })

  it("string 2", () => {
    const collection = "abca".split("");
    const res = partition(collection, s => s === 'a')
    expect(res).toEqual([["a", "a"], ["b", "c"]]);
  })

  it("object 1", () => {
    const collection = [
      {
        name: "dby",
        age: 12
      },
      {
        name: "dn",
        age: 233
      }
    ];
    const res = partition(collection, o => o.age === 233)
    expect(res).toEqual([
      [
        {
          name: "dn",
          age: 233
        }
      ], 
      [
        {
          name: "dby",
          age: 12
        }
      ]
    ]);
  })

  it("object 2", () => {
    const collection = [
      {
        name: "dby",
        age: 12
      },
      {
        name: "dn",
        age: 233
      }
    ];
    const res = partition(collection, o => o.age === 666)
    expect(res).toEqual([[], [
      {
        name: "dby",
        age: 12
      },
      {
        name: "dn",
        age: 233
      }
    ]]);
  })
})
