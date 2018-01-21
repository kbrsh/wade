const Wade = require("../../dist/wade.js");
const expect = require("chai").expect;

describe("Search Index", function() {
  it("should create a search index", function() {
    const index = Wade(["Hey", "Hello", "Branch"]).index;
    expect(index).to.deep.equal([
      [-97],
      [
        [-113],
        [
          [-96],
          [[-109], [[-98], [[-103], [[undefined, 1.1666666666666667, 2]]]]]
        ]
      ],
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      [
        [-100],
        [
          [-107],
          [[-107], [[-110], [[undefined, 1.1666666666666667, 1]]]],
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          [[undefined, 1.1666666666666667, 0]]
        ]
      ]
    ]);
  });
});
