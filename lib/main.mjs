#!/usr/bin/env node

import { readFile, writeFile } from "fs/promises";
import {
  FAILURE_STATUS,
  SUCCESS_STATUS,
  MEMOIZED_STATUS,
  turtleAsync,
} from "./index.mjs";
import { log, logBlue, logGreen, logRed, getMap } from "./util.mjs";
import {
  createRight,
  bindRight,
  mapRight,
  fromEither,
  bindLeft,
  bindRightAsync,
  wrap,
  wrapAsync,
  wrapConstructor,
} from "./either.mjs";

const { from } = Array;
const { parse, stringify } = JSON;
const parseEither = wrap(parse);
const getMapEither = wrap(getMap);
const readFileEitherAsync = wrapAsync(readFile);
const writeFileEitherAsync = wrapAsync(writeFile);
const createRegExpEither = wrapConstructor(RegExp);

const default_stdio = "inherit";
const default_filter_regexp = "^[^.]";
const default_regexp_flags = "u";
const default_memoization_path = ".turtle.json";
const default_ordering_filename = ".test.list";

const layouts = new Map([
  [
    "alongside",
    {
      format: { regexp: /^(.*)\.([^./]+)$/u, template: "$1.test.$2" },
      filter: { regexp: /^[^.](.*)(?<!(\.test))\.([^./]+)$/u },
    },
  ],
  [
    "separated",
    {
      format: { regexp: /^lib\/(.*)$/u, template: "test/$1" },
      filter: { regexp: /^[^.]/u },
    },
  ],
]);

export const mainAsync = async (options) => {
  options = {
    layout: null,
    "filter-regexp": default_filter_regexp,
    "filter-regexp-flags": default_regexp_flags,
    stdio: default_stdio,
    "format-regexp": "^$",
    "format-regexp-flags": default_regexp_flags,
    "format-template": "",
    "memoization-path": default_memoization_path,
    "ordering-filename": default_ordering_filename,
    target: ".",
    memoization: true,
    timeout: 0,
    help: false,
    _: null,
    ...options,
  };
  const {
    help,
    _: { length },
  } = options;
  if (help || length !== 1) {
    log(
      [
        "usage: npx test-turtle <command>",
        "  <command>",
        "      The command to execute for each test.",
        "      First argument: relative path of the target file.",
        "      Second argument: relative path of the test file.",
        '      Example: "npx c8 --include $1 -- node $2"',
        "  --stdio",
        "      What to do with the command's stdio",
        `      Default: "${default_stdio}"`,
        "  --timeout",
        "      The number of millisecond before sending SIGTERM to the command.",
        "      One second later, SIGKILL will be send.",
        "      Default: 0 (no timeout)",
        "  --target",
        "      The root directory from which to start exploring.",
        '      Default: "."',
        "  --layout-filename",
        "      The name of the file indicating test layout.",
        `      Default: "${default_ordering_filename}"`,
        "  --memoization-path",
        "      The path to the file for reading and writing memoization data.",
        `      Default: "${default_memoization_path}"`,
        "  --layout",
        `      Use a predefined layout: ${stringify(from(layouts.keys()))}.`,
        "      This option overrides the '--format' and '--filter' options.",
        "  --format-regexp",
        "      A regular expression to decompose the parts of a target's relative path.",
        "  --format-regexp-flags",
        "      The flags to use for --format-regexp",
        `      Default: "${default_regexp_flags}"`,
        "  --format-template",
        "      The template string to format the parts of the target file.",
        "  --filter-regexp",
        "      Regular expression to indicate whether a file should be tested",
        "      when no layout file is present in the directory.",
        `      Default: "${default_filter_regexp}"`,
        "  --filter-regexp-flags",
        "      The flags to use for --filter-regexp.",
        `      Default: "${default_regexp_flags}`,
        "  --no-memoization",
        "      Disable memoization.",
        "  --help",
        "      Print this message.",
      ].join("\n"),
      "utf8",
    );
    return help && length === 0 ? 0 : 1;
  } else {
    const {
      timeout,
      _: [command],
      target,
      stdio,
      layout,
      "ordering-filename": ordering,
      "memoization-path": path,
      "filter-regexp": filter_regexp_source,
      "filter-regexp-flags": filter_regexp_flags,
      "format-regexp": format_regexp_source,
      "format-regexp-flags": format_regexp_flags,
      "format-template": format_template,
    } = options;
    let either = await readFileEitherAsync(path, "utf8");
    either = bindLeft(either, () => createRight("null"));
    either = bindRight(either, parseEither);
    either = bindRight(either, (memo) => {
      let either;
      if (layout === null) {
        either = bindRight(
          mapRight(
            createRegExpEither(filter_regexp_source, filter_regexp_flags),
            (regexp) => ({ regexp }),
          ),
          (filter) =>
            mapRight(
              mapRight(
                createRegExpEither(format_regexp_source, format_regexp_flags),
                (regexp) => ({ regexp, template: format_template }),
              ),
              (format) => ({ filter, format }),
            ),
        );
      } else {
        either = getMapEither(layouts, layout);
      }
      return mapRight(either, ({ format, filter }) => ({
        format,
        filter,
        memo,
      }));
    });
    either = await bindRightAsync(
      either,
      async ({ memo: memo1, format, filter }) => {
        const { status, memo: memo2 } = await turtleAsync(target, memo1, {
          command,
          cwd: target,
          stdio,
          timeout,
          ordering,
          filter,
          format,
        });
        return mapRight(
          await writeFileEitherAsync(path, stringify(memo2, null, 2), "utf8"),
          () => status,
        );
      },
    );
    return fromEither(
      either,
      (message) => {
        logRed(`\nError: ${message}\n`);
        return 1;
      },
      (status) => {
        if (status === FAILURE_STATUS) {
          logRed("\nFailure\n");
          return 1;
        }
        if (status === SUCCESS_STATUS) {
          logGreen("\nSuccess\n");
          return 0;
        }
        if (status === MEMOIZED_STATUS) {
          logBlue("\nMemoized\n");
          return 0;
        }
        /* c8 ignore start */
        throw new Error("invalid status");
        /* c8 ignore stop */
      },
    );
  }
};
