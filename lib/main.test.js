const FileSystem = require("fs");
const { strict: Assert } = require("assert");

const { turtle } = require("./main.js");

FileSystem.writeFileSync("tmp/.test.conf", "abs\nempty/", "utf8");
FileSystem.writeFileSync(
  "tmp/abs.js",
  "exports.abs = (x) => x > 0 ? x : -x;",
  "utf8",
);
FileSystem.writeFileSync(
  "tmp/abs.test.js",
  "const {abs} = require('./abs.js'); abs(10); abs(-10);",
  "utf8",
);
try {
  FileSystem.mkdirSync("tmp/empty");
} catch (error) {
  Assert.equal(error.code, "EEXIST");
}
FileSystem.writeFileSync("tmp/empty/.test.conf", "", "utf8");

const trace = [];

const options = {
  ext: "js",
  memo: true,
  info: () => {},
  each: (...args) => {
    trace.push(args);
  },
};

// Normal //
Assert.deepEqual(turtle("tmp/", options), null);
Assert.deepEqual(trace, [["tmp/abs.js", "tmp/abs.test.js"]]);

// Memoized //
trace.length = 0;
Assert.deepEqual(turtle("tmp/", options), null);
Assert.deepEqual(trace, []);
