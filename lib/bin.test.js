const FileSystem = require("fs");
const { strict: Assert } = require("assert");

const run = (argv) => {
  process.argv = argv;
  process.exitCode = 0;
  delete require.cache[`${__dirname}/bin.js`];
  require("./bin.js");
  return process.exitCode;
};

// Help //
Assert.equal(run(["node", "lib/bin.js", "--help"]), 0);

// Success //
FileSystem.writeFileSync("tmp/.test.conf", "", "utf8");
Assert.equal(run(["node", "lib/bin.js", "tmp"]), 0);

// Base Error //
FileSystem.writeFileSync("tmp/.test.conf", "foo", "utf8");
FileSystem.writeFileSync("tmp/foo.js", "", "utf8");
FileSystem.writeFileSync("tmp/foo.test.js", "throw 'BOUM';", "utf8");
Assert.equal(
  run([
    "node",
    "lib/bin.js",
    "tmp",
    "--before",
    "echo $1",
    "--after",
    "echo $2",
  ]),
  1,
);

// Meta Error //
FileSystem.writeFileSync(
  "tmp/.test.conf",
  "invalid=configuration=line",
  "utf8",
);
Assert.throws(
  () => run(["node", "lib/bin.js", "tmp"]),
  /^Error: cannot parse line/,
);

process.stdout.write("SUCCESS\n");
