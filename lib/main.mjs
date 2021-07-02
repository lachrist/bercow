#!/usr/bin/env node

import FileSystem from "fs/promises";
import Path from "path";
import { assert } from "./assert.mjs";
import { spawnAsync } from "./spawn.mjs";
import { turtleAsync } from "./index.mjs";

export const mainAsync = async (options) => {
  options = {
    "replace-regexp-body": "(.*)\\.([a-zA-Z]+)",
    "replace-regexp-flags": "u",
    "replace-template": "$1.test.$2",
    memoization: true,
    "memoization-filename": ".turtle.json",
    "layout-filename": ".test.list",
    target: ".",
    help: false,
    _: null,
    ...options,
  };
  if (options.help || options._.length !== 1) {
    process.stdout.write(
      [
        "usage: npx test-turtle <command>",
        "  <command>",
        "      The command to execute for each test.",
        "      First argument: relative path of the target file.",
        "      Second argument: relative path of the test file.",
        '      Example: "npx c8 --include $1 -- node $2"',
        "  --target",
        "      Path to the root directory from which to start testing files.",
        '      Default: "."',
        "  --replace-regexp-body",
        "      The body of a regular expression to extract parts from target file.",
        '      Default: "^(.*)\\.([a-z])$"',
        "  --replace-regexp-flags",
        "      The flags of a regular expression to extract parts from target file,",
        '      Default: "u"',
        "  --replace-template",
        "      The template to replace the parts of the target file.",
        '      Default: "$1.test.$2"',
        "  --layout-filename",
        "      The name of the file indicating test layout.",
        '      Default: ".test.list"',
        "  --memoization-filename",
        "      The name of the file to store memoization data.",
        '      Default: ".turtle.json"',
        "  --no-memoization",
        "      Disable memoization.",
        "  --help",
        "      Print this message.",
        "",
      ].join("\n"),
      "utf8",
    );
  } else {
    const path = Path.join(options.target, options["memoization-filename"]);
    const regexp = new RegExp(
      options["replace-regexp-body"],
      options["replace-regexp-flags"],
    );
    let memo = null;
    if (options.memoization) {
      try {
        memo = JSON.parse(await FileSystem.readFile(path, "utf8"));
      } catch (error) {
        assert(
          error.code === "ENOENT",
          "cannot read memoization file >> %s",
          error.message,
        );
      }
    }
    const result = await turtleAsync(options.target, memo, {
      layout: options["layout-filename"],
      runAsync: (main, test) =>
        spawnAsync("/bin/sh", ["-c", options._[0], "turtle", main, test]),
      getTestFile: (main) => main.replace(regexp, options["replace-template"]),
    });
    await FileSystem.writeFile(
      path,
      JSON.stringify(result.memo, null, 2),
      "utf8",
    );
  }
};
