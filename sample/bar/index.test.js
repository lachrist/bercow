const {getFooBar} = require("./index.js");
if (getFooBar() !== "foobar") {
  throw new Error("expected 'foobar'");
}
