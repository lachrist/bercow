const {getFooBar} = require("./foobar.js");
if (getFooBar() !== "foobar") {
  throw new Error("expected 'foobar'");
}
