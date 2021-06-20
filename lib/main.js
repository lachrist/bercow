const Crypto = require("crypto");
const FileSystem = require("fs");
const ChildProcess = require("child_process");

class TestFailureError extends Error {}

class TestCoverageError extends Error {}

const isNotEmpty = (string) => string !== "";

const spawnSync = (command, args) => {
  const { signal, status } = ChildProcess.spawnSync(command, args, {
    stdio: "inherit",
  });
  /* c8 ignore start */
  if (signal !== null) {
    throw new Error(`${[command, ...args].join(" ")} killed with ${signal}`);
  }
  /* c8 ignore stop */
  return status;
};

const parseLine = (line) => {
  console.log(line);
  if (line.includes("=")) {
    const parts = /^([^=]*)=([^=]+)$/u.exec(line);
    if (parts === null) {
      throw new Error(`cannot parse line: ${JSON.stringify(line)}`);
    }
    return [parts[1].trim(), parts[2].trim()];
  }
  return [line.trim(), null];
};

const stringifyLine = ([key, value]) =>
  value === null ? key : `${key} = ${value}`;

const loop = (path, key, value, options) => {
  path = `${path}/${key}`;
  if (value === null) {
    FileSystem.writeFileSync(
      `${path}/.test.conf`,
      FileSystem.readFileSync(`${path}/.test.conf`, "utf8")
        .split("\n")
        .filter(isNotEmpty)
        .map(parseLine)
        .map(([key, value]) => loop(path, key, value, options))
        .map(stringifyLine)
        .join("\n"),
      "utf8",
    );
  } else {
    const hash = Crypto.createHash("md5");
    hash.update(FileSystem.readFileSync(`${path}.test.${options.ext}`));
    hash.update(FileSystem.readFileSync(`${path}.${options.ext}`));
    const digest = hash.digest("hex");
    if (digest !== value) {
      if (spawnSync("node", [`${path}.test.${options.ext}`]) !== 0) {
        throw new TestFailureError(`test failure at ${path}`);
      }
      if (
        spawnSync("/bin/sh", [
          "-c",
          `npx c8 ${options.cov} --include=${path}.${options.ext} node ${path}.test.${options.ext}`,
        ]) !== 0
      ) {
        spawnSync("/bin/sh", [
          "-c",
          `npx c8 --reporter=html --include=${path}.${options.ext} node ${path}.test.${options.ext} && open coverage/index.html`,
        ]);
        throw new TestCoverageError(`test coverage failure at ${path}`);
      }
      value = digest;
    }
  }
  return [key, value];
};

exports.turtle = loop;
exports.TestFailureError = TestFailureError;
exports.TestCoverageError = TestCoverageError;
