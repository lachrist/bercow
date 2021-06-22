const Crypto = require("crypto");
const FileSystem = require("fs");
const { assert } = require("./assert.js");

const isNotEmpty = (string) => string !== "";

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
    assert(
      memo === null,
      Error,
      "directory entries should not be associated to any value (ie the memoization)",
    );
    let pairs = FileSystem.readFileSync(`${path}.test.conf`, "utf8")
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
      options.each(main, test);
      memo = digest;
    }
  }
  return memo;
};

exports.turtle = (path, options) => loop(path, null, { ...options });
