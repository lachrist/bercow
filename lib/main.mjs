#!/usr/bin/env node

import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { assert } from "./assert.mjs";
import { spawnAsync } from "./spawn.mjs";
import { turtleAsync } from "./index.mjs";

const { stdout } = process;
const { parse, stringify } = JSON;
const parseEither = wrap(parse);
const readFileEitherAsync = wrapAsync(readFile);

const default_filter_regexp = "^";
const default_filter_regexp_flags = "u";
const default_replace_regexp = "^lib/(.*)$";
const default_replace_regexp_flags = "u";
const default_replace_template = "test/$1";
const default_memoization_path = ".turtle.json";
const default_layout_filename = ".test.list";

export const mainAsync = async (options) => {
  options = {
    "filter-regexp": default_filter_regexp,
    "filter-regexp-flags": default_filter_regexp_flags,
    "replace-regexp": default_replace_regexp,
    "replace-regexp-flags": default_replace_regexp_flags,
    "replace-template": default_replace_template,
    "memoization-path": default_memoization_path,
    "layout-filename": default_layout_filename,
    memoization: true,
    timeout: 0,
    help: false,
    target: ".",
    _: null,
    ...options,
  };
  const {
    help,
    _: { length },
  } = options;
  if (help || length !== 1) {
    stdout.write(
      [
        "usage: npx test-turtle <command>",
        "  <command>",
        "      The command to execute for each test.",
        "      First argument: relative path of the target file.",
        "      Second argument: relative path of the test file.",
        '      Example: "npx c8 --include $1 -- node $2"',
        "  --timeout",
        "      The number of millisecond before sending SIGTERM to the command.",
        "      One second later, SIGKILL will be send.",
        "      Default: 0 (no timeout)",
        "  --home-directory",
        "      The directory to start testing from.",
        "      Default: \".\"",
        "  --layout-filename",
        "      The name of the file indicating test layout.",
        `      Default: "${default_layout_filename}"`,
        "  --memoization-path",
        "      The path to the file for reading and writting memoization data.",
        `      Default: "${default_memoization_path}"`,
        "  --replace-regexp",
        "      A regular expression to extract parts from target file.",
        `      Default: "${default_replace_regexp}"`,
        "  --replace-regexp-flags",
        "      The flags to use for --replace-regexp",
        `      Default: "${default_replace_regexp_flags}"`,
        "  --replace-template",
        "      The template to replace the parts of the target file.",
        `      Default: "${default_replace_template}"`,
        "  --filter-regexp",
        "      Regular expression to indicate whether a file should be tested",
        "      when no layout file is present in the directory.",
        `      Default: "${default_filter_regexp}"`,
        "  --filter-regexp-flags",
        "      The flags to use for --filter-regexp.",
        `      Default: "${default_filter_regexp_flags}`,
        "  --no-memoization",
        "      Disable memoization.",
        "  --help",
        "      Print this message.",
      ].join("\n"),
      "utf8",
    );
    return length === 1;
  } else {
    const {,
      timeout,
      _: [command],
      "home-directory": home_directory,
      "layout-filename": layout_filename,
      "memoization-path": memoization_path,
      "filter-regexp": filter_regexp_source,
      "filter-regexp-flags": filter_regexp_flags,
      "transform-regexp": transform_regexp_source,
      "transform-regexp-flags": transform_regexp_flags,
    } = options;
    let either = createRight(null);
    either = await bindRightAsync(either, async () => await readFileEitherAsync(memoization_path));
    either = bindLeft(either, () => createRight("null"));
    either = bindRight(either, parseEither);
    either = await bindRightAsync(either, (memo1) => {
      const ({ status, memo:memo2 } = await turtleAsync(home_directory, memo1, {
        command,
        timeout,
        layout_filename,
        filter_regexp: new RegExp(filter_regexp_source, filter_regexp_flags),
        transform_regexp: new RegExp(transform_regexp_source, transform_regexp_flags),
      }));
      if (status === FAILURE) {
        return createLeft("test failure");
      }
      return createRight(status === MEMOIZED_STATUS);
    });
    return fromEither(
      either,
      (message) => {
        logRed(message);
        return false;
      },
      (memoized) => {
        if (memoized) {
          logBlue("Memoized");
        } else {
          logBlue("Success");
        }
        return true;
      },
    );
  }
};
