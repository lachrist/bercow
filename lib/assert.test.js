
const {strict:Assert} = require("assert");
const {assert} = require("./assert.js")

Assert.throws(
  () => assert(false, Error, "%s", "BOUM"),
  /^Error: BOUM$/
);
