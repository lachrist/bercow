const Crypto = require("crypto");
const FileSystem = require("fs");
const ChildProcess = require("child_process");
const {assert} = require("./assert.js");

class TestFailureError extends Error {
  constructor (path) {
    super(`test failure: ${path}`);
  }
}

class TestCoverageError extends Error {
  constructor (path) {
    super(`test coverage failure: ${path}`);
    spawnSync("/bin/sh", [
      "-c",
      `npx c8 --reporter=html node ${path} && open coverage/index.html`,
    ]);
  }
}

const isNotEmpty = (string) => string !== "";

const spawnSync = (command, args) => {
  const { signal, status } = ChildProcess.spawnSync(command, args, {
    stdio: "inherit",
  });
  assert(signal === null, Error, `%s %j killed with %s`, command, args, signal);
  return status;
};

const parseLine = (line) => {
  if (line.includes("=")) {
    const parts = /^([^=]+)=([^=]*)$/u.exec(line);
    assert(parts !== null, Error, "cannot parse line: %j", line);
    return [parts[1].trim(), parts[2].trim()];
  }
  return [line.trim(), null];
};

const stringifyLine = ([key, value]) =>
  value === null ? key : `${key} = ${value}`;

const loop = (path, memo, options) => {
  if (path === "" || path.endsWith("/")) {
    assert(memo === null, Error, "directory entries should not an associated value (ie the memoization)");
    let pairs = FileSystem
      .readFileSync(`${path}.test.conf`, "utf8")
      .split("\n")
      .filter(isNotEmpty)
      .map(parseLine);
    try {
      for (const pair of pairs) {
        pair[1] = loop(`${path}${pair[0]}`, pair[1], options);
      }
    } finally {
      FileSystem.writeFileSync(
        `${path}.test.conf`,
        pairs.map(stringifyLine).join("\n"),
        "utf8",
      );
    }
  } else {
    const hash = Crypto.createHash("md5");
    hash.update(FileSystem.readFileSync(`${path}.test.${options.ext}`));
    hash.update(FileSystem.readFileSync(`${path}.${options.ext}`));
    const digest = hash.digest("hex");
    if (options.memo && digest === memo) {
      options.info(`memoized ${path}`);
    } else {
      options.memo = false;
      options.info(`running  ${path}...`);
      const main = `${path}.${options.ext}`;
      const test = `${path}.test.${options.ext}`;
      assert(
        spawnSync("node", [test]) === 0,
        TestFailureError,
        test
      );
      assert(
        spawnSync("/bin/sh", [
          "-c",
          `npx c8 ${options.cov} --include=${main} node ${test}`,
        ]) === 0,
        TestCoverageError,
        test
      );
      memo = digest;
    }
  }
  return memo;
};

exports.turtle = (path, options) => loop(path, null, {...options});
exports.TestFailureError = TestFailureError;
exports.TestCoverageError = TestCoverageError;
