const {getFooBarQux} = require("./qux.js");
if (getFooBarQux() !== "foobarqux") {
  throw new Error("expected 'foobarqux'");
}
