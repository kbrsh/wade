const Wade = require("../../dist/wade.js");
const expect = require("chai").expect;

describe("Search Index", function() {
  const search = Wade(["Hey", "Hello", "Branch"]);
  const index = search.index;

  it("should create a search index", function() {
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

  it("should load a saved index", function() {
    expect(index).to.deep.equal(Wade("[[-97],[[-113],[[-96],[[-109],[[-98],[[-103],[[@1,1.1666666666666667,2]]]]]]],@5,[[-100],[[-107],[[-107],[[-110],[[@1,1.1666666666666667,1]]]],@12,[[@1,1.1666666666666667,0]]]]]").index);
  });
});
