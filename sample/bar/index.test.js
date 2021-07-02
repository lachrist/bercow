const {getBar} = require("./index.js");
if (getBar() !== "bar") {
  throw new Error("expected 'bar'");
}
