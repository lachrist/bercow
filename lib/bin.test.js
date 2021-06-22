const FileSystem = require("fs");
const { strict: Assert } = require("assert");

const run = (argv) => {
  process.argv = argv;
  process.exitCode = 0;
  delete require.cache[`${__dirname}/bin.js`];
  require("./bin.js");
  return process.exitCode;
};

Assert.equal(run(["node", "lib/bin.js", "--help"]), 0);

FileSystem.writeFileSync("tmp/foo.js", "", "utf8");
FileSystem.writeFileSync("tmp/foo.test.js", "", "utf8");

FileSystem.writeFileSync("tmp/.test.conf", "foo", "utf8");
Assert.equal(
  run(["node", "lib/bin.js", "tmp", "--each", "echo $1 && echo $2"]),
  0,
);

FileSystem.writeFileSync("tmp/.test.conf", "foo", "utf8");
Assert.equal(run(["node", "lib/bin.js", "tmp", "--each", "exit 1"]), 1);

FileSystem.writeFileSync(
  "tmp/.test.conf",
  "invalid=configutation=line",
  "utf8",
);
Assert.throws(
  () => run(["node", "lib/bin.js", "tmp", "--each", "foobar"]),
  /^Error: cannot parse line/,
);
