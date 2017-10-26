const Wade = require("../../dist/wade.js");
const expect = require("chai").expect;

describe("Search Index", function() {
  it("should create a search index", function() {
    const index = Wade(["Hey", "Hello", "Branch"]).index;
    expect(index).to.deep.equal({
      "h": {
        "e": {
          "y": {
            "data": [
              1.1666666666666667,
              0
            ]
          },
          "l": {
            "l": {
              "o": {
                "data": [
                  1.1666666666666667,
                  1
                ]
              }
            }
          }
        }
      },
      "b": {
        "r": {
          "a": {
            "n": {
              "c": {
                "h": {
                  "data": [
                    1.1666666666666667,
                    2
                  ]
                }
              }
            }
          }
        }
      }
    });
  });
});
