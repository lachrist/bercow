#!/usr/bin/env node

const minimist = require("minimist");
const Chalk = require("chalk");
const Path = require("path");
const { turtle } = require("./main.js");
const { spawn, ExitSpawnError } = require("./spawn.js");

const options = {
  help: false,
  ext: "js",
  memo: true,
  each: [],
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
      "  --no-memo: disable memoization",
      "  --each: command(s) to run on each test",
      "  --help: print this message",
    ].join("\n"),
    "utf8",
  );
} else {
  let dir = options._[0];
  dir = Path.relative(process.cwd(), dir);
  if (dir !== "") {
    dir = `${dir}/`;
  }
  if (!Array.isArray(options.each)) {
    options.each = [options.each];
  }
  {
    const commands = options.each;
    options.each = (main, test) => {
      for (let command of commands) {
        spawn("/bin/sh", ["-c", command, "-", main, test]);
      }
    };
  }
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
