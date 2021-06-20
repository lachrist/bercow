const Crypto = require("crypto");
const FileSystem = require("fs");
const ChildProcess = require("child_process");

class TestFailureError extends Error {}

class TestCoverageError extends Error {}

const isNotEmpty = (string) => string !== "";

const parseLine = (line) => {
  if (line.includes("=")) {
    const parts = /^([^=]*)=([=^]+)$/u.exec(line);
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
      `${path}/.test.cnf`,
      FileSystem.readFileSync(`${path}/.test.cnf`, "utf8")
        .split("\n")
        .filter(isNotEmpty)
        .map(parseLine)
        .map(([key, value]) => loop(path, key, value))
        .map(stringifyLine)
        .join("\n"),
      "utf8",
    );
  } else {
    const hash = Crypto.createHash("md5");
    hash.update(FileSystem.readFileSync(`${path}.test.${options.ext}`));
    hash.update(FileSystem.readFileSync(`${path}.${options.ext}`));
    const digest = hash.digest("hex");
    if (digest !== key) {
      {
        const { signal, status } = ChildProcess.spawnSync(
          "node",
          [`${path}.test.${options.ext}`],
          { stdio: "inherit" },
        );
        if (signal !== null) {
          throw new Error(`test killed with: ${signal}`);
        }
        if (status !== 0) {
          throw new TestFailureError(`text exited with: ${status}`);
        }
      }
      {
        const { signal, status } = ChildProcess.spawnSync(
          "/bin/sh",
          [
            "-c",
            `npx c8 ${options.cov} --include=${path}.${options.ext} node ${path}.test.${options.ext}`,
          ],
          { stdio: "inherit" },
        );
        if (signal !== null) {
          throw new Error(`c8 test killed with: ${signal}`);
        }
        if (status !== 0) {
          ChildProcess.spawnSync(
            "/bin/sh",
            [
              "-c",
              `npx c8 --reporter=html --include=lib/${path}.${options.ext} node lib/${path}.test.${options.ext} && open coverage/index.html`,
            ],
            { stdio: "inherit" },
          );
          throw new TestCoverageError(`c8 test exited with: ${status}`);
        }
      }
      key = digest;
    }
  }
  return [key, value];
};

exports.turtle = loop;
exports.TestFailureError = TestFailureError;
exports.TestCoverageError = TestCoverageError;
