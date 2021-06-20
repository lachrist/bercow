const FileSystem = require("fs");
const { strict: Assert } = require("assert");
const ChildProcess = require("child_process");

const { turtle, TestFailureError, TestCoverageError } = require("./main.js");

{
  const { signal, status } = ChildProcess.spawnSync("rm", ["-rf", "tmp/test"], {
    stdio: "inherit",
  });
  Assert.equal(signal, null);
  Assert.equal(status, 0);
}

FileSystem.mkdirSync("tmp/test");
FileSystem.writeFileSync(
  "tmp/test/.test.conf",
  "abs = undefined\nempty",
  "utf8",
);
FileSystem.writeFileSync(
  "tmp/test/abs.js",
  "exports.abs = (x) => x > 0 ? x : -x;",
  "utf8",
);
FileSystem.writeFileSync(
  "tmp/test/abs.test.js",
  "const {abs} = require('./abs.js'); abs(10); abs(-10);",
  "utf8",
);
FileSystem.mkdirSync("tmp/test/empty");
FileSystem.writeFileSync("tmp/test/empty/.test.conf", "", "utf8");

const options = {
  ext: "js",
  cov: "--check-coverage --branches=100",
};

// Help //
process.argv = ["node", "lib/bin.js", "--help"];
require("./bin.js");
Assert.equal(process.exitCode, undefined);

// Normal //
Assert.deepEqual(turtle("tmp", "test", null, options), ["test", null]);
process.argv = ["node", "lib/bin.js", "--dir", "tmp/test"];
delete require.cache[`${__dirname}/bin.js`];
require("./bin.js");
Assert.equal(process.exitCode, undefined);

// Memoized //
Assert.deepEqual(turtle("tmp", "test", null, options), ["test", null]);

// TestFailureError //
FileSystem.writeFileSync("tmp/test/abs.test.js", "throw 'BOUM';", "utf8");
Assert.throws(() => turtle("tmp", "test", null, options), TestFailureError);
ChildProcess.spawnSync("node", ["lib/bin.js", "--dir", "tmp/test"], {
  stdio: "inherit",
});
process.argv = ["node", "lib/bin.js", "--dir", "tmp/test"];
delete require.cache[`${__dirname}/bin.js`];
require("./bin.js");
Assert.equal(process.exitCode, 1);
process.exitCode = undefined;

// TestCoverageError //
FileSystem.writeFileSync(
  "tmp/test/abs.test.js",
  "const {abs} = require('./abs.js'); abs(10);",
  "utf8",
);
Assert.throws(() => turtle("tmp", "test", null, options), TestCoverageError);

// ParsingError //
FileSystem.writeFileSync(
  "tmp/test/.test.conf",
  "invalid=configuration=line",
  "utf8",
);
Assert.throws(() => turtle("tmp", "test", null, options), Error);
process.argv = ["node", "lib/bin.js", "--dir", "tmp/test"];
delete require.cache[`${__dirname}/bin.js`];
Assert.throws(() => require("./bin.js"), Error);

process.stdout.write("SUCCESS\n");
