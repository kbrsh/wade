const Wade = require("../../dist/wade.js");
const expect = require("chai").expect;

describe("Search", function() {
  const data = ["I have to get that suit.", "He's the worst, earth.", "what do you want?", "it is the man.", "the man doesn't have the money."];
  const search = Wade(data);

  describe("single term", function() {
    const results = search("man");

    it("should have two results", function() {
      expect(results.length).to.equal(2);
    });

    it("should have relevant results", function() {
      expect(results[0].index).to.equal(3);
      expect(results[1].index).to.equal(4);
    });
  });

  describe("single term with prefix", function() {
    const results = search("wor");

    it("should have one result", function() {
      expect(results.length).to.equal(1);
    });

    it("should have relevant results", function() {
      expect(results[0].index).to.equal(1);
    });
  });

  describe("multiple terms for one result", function() {
    const results = search("worst earth");

    it("should have one result", function() {
      expect(results.length).to.equal(1);
    });

    it("should have relevant results", function() {
      expect(results[0].index).to.equal(1);
    });
  });

  describe("multiple terms for one result with prefix", function() {
    const results = search("worst ear");

    it("should have one result", function() {
      expect(results.length).to.equal(1);
    });

    it("should have relevant results", function() {
      expect(results[0].index).to.equal(1);
    });
  });

  describe("multiple terms for multiple results", function() {
    const results = search("get that suit worst earth");

    it("should have one result", function() {
      expect(results.length).to.equal(2);
    });

    it("should have relevant results", function() {
      expect(results[0].index).to.equal(0);
      expect(results[1].index).to.equal(1);
    });
  });

  describe("multiple terms for multiple results with prefix", function() {
    const results = search("get that suit worst ear");

    it("should have one result", function() {
      expect(results.length).to.equal(2);
    });

    it("should have relevant results", function() {
      expect(results[0].index).to.equal(0);
      expect(results[1].index).to.equal(1);
    });
  });
});
