const Wade = require("../../dist/wade.js");
const expect = require("chai").expect;

const processEntry = function(entry) {
  if(entry.length === 0) {
    return entry;
  } else {
    const processors = Wade.config.processors;

    for(let i = 0; i < processors.length; i++) {
      entry = processors[i](entry);
    }

    return entry;
  }
}

describe("Processing", function() {
  it("should process data", function() {
    expect(processEntry("ALL UPPERCASE!!")).to.equal("uppercase");
    expect(processEntry("This. is wade")).to.equal("wade");
    expect(processEntry("")).to.equal("");
  });
});
