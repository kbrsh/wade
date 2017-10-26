const Wade = require("../../dist/wade.js");
const expect = require("chai").expect;

describe("Processing", function() {
  it("should process data", function() {
    expect(Wade.process("ALL UPPERCASE!!")).to.equal("uppercase");
    expect(Wade.process("This. is wade")).to.equal("wade");
    expect(Wade.process("")).to.equal("");
  });
});
