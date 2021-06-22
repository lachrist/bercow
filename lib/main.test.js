const FileSystem = require("fs");
const { strict: Assert } = require("assert");

const { turtle, TestFailureError, TestCoverageError } = require("./main.js");

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

const options = {
  ext: "js",
  cov: "--check-coverage --branches=100",
  memo: true,
  info: () => {},
  before: () => {},
  after: () => {},
};

// Normal //
Assert.deepEqual(turtle("tmp/", options), null);
process.argv = ["node", "lib/bin.js", "--dir", "tmp/main"];

// Memoized //
Assert.deepEqual(turtle("tmp/", options), null);

// TestFailureError //
FileSystem.writeFileSync("tmp/abs.test.js", "throw 'BOUM';", "utf8");
Assert.throws(() => turtle("tmp/", options), TestFailureError);

// TestCoverageError //
FileSystem.writeFileSync(
  "tmp/abs.test.js",
  "const {abs} = require('./abs.js'); abs(10);",
  "utf8",
);
Assert.throws(() => turtle("tmp/", options), TestCoverageError);

// ParsingError //
FileSystem.writeFileSync(
  "tmp/.test.conf",
  "invalid=configuration=line",
  "utf8",
);
Assert.throws(() => turtle("tmp/", options), Error);

process.stdout.write("SUCCESS\n");
