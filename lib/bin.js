#!/usr/bin/env node

const minimist = require("minimist");
const Chalk = require("chalk");
const Path = require("path");
const { turtle } = require("./main.js");
const { spawn, ExitSpawnError } = require("./spawn.js");

const options = {
  help: false,
  cov: 100,
  ext: "js",
  memo: true,
  before: [],
  after: [],
  _: null,
  ...minimist(process.argv.slice(2)),
  info: (line) => process.stdout.write(`${Chalk.blue(line)}${"\n"}`),
};

if (options.help || options._.length !== 1) {
  process.stderr.write(
    [
      "usage: npx test-turtle <dir>",
      "  <dir>: the root directory to start testing from",
      "  --ext: the file extension used by the project, it",
      "         is curently not possible to mix extensions",
      "  --cov: the minimum coverage threshold (0, 100)",
      "  --no-memo: disable memoization",
      "  --before: command(s) to run before each test",
      "  --after: command(s) to run after each test",
    ].join("\n"),
    "utf8",
  );
} else {
  let dir = options._[0];
  dir = Path.relative(process.cwd(), dir);
  if (dir !== "") {
    dir = `${dir}/`;
  }
  options.cov = String(options.cov);
  options.cov = [
    "--check-coverage",
    `--branches=${options.cov}`,
    `--functions=${options.cov}`,
    `--lines=${options.cov}`,
    `--statements=${options.cov}`,
  ].join(" ");
  const makeRun = (commands) => (main, test) => {
    for (let command of commands) {
      spawn("/bin/sh", ["-c", command, "-1", main, "-2", test]);
    }
  };
  if (!Array.isArray(options.before)) {
    options.before = [options.before];
  }
  options.before = makeRun(options.before);
  if (!Array.isArray(options.after)) {
    options.after = [options.after];
  }
  options.after = makeRun(options.after);
  try {
    turtle(dir, options);
  } catch (error) {
    if (error instanceof ExitSpawnError) {
      process.exitCode = 1;
      process.stderr.write(`${Chalk.red(error.message)}${"\n"}`);
    } else {
      throw error;
    }
  }
}
