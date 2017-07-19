const Wade = require("../../dist/wade.js");
const expect = require("chai").expect;

describe("Processing", function() {
  it("should process data", function() {
    const data = Wade(["ALL UPPERCASE!!", "This. is wade"]).data;

    expect(data[0]).to.equal('uppercase');
    expect(data[1]).to.equal('wade');
  });
});
