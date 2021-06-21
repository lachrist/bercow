const {getFoo} = require("./foo.js");
if (getFoo() !== "foo") {
  throw new Error("expected 'foo'");
}
