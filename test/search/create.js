const Wade = require("../../dist/wade.js");
const expect = require("chai").expect;

describe("Create Search", function() {
  it("should create a search function", function() {
    const search = Wade([]);
    expect(search).to.be.a('function');
  });
});
