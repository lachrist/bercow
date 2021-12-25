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

const { from, isArray } = Array;
const { parse, stringify } = JSON;
const parseEither = wrap(parse);
const getMapEither = wrap(getMap);
const readFileEitherAsync = wrapAsync(readFile);
const writeFileEitherAsync = wrapAsync(writeFile);
const createRegExpEither = wrapConstructor(RegExp);

const default_test_var = "TURTLE_TEST";
const default_main_var = "TURTLE_MAIN";
const default_stdio = "inherit";
const default_exclude_regexp = "^\\.";
const default_regexp_flags = "u";
const default_memoization_path = ".turtle.json";
const default_ordering_filename = ".test.list";

const layouts = new Map([
  [
    "alongside",
    {
      format: { regexp: /^(.*)\.([^./]+)$/u, template: "$1.test.$2" },
      exclude: { regexp: /(^\.)|(\.test\.[^.]+$)/u },
    },
  ],
  [
    "separated",
    {
      format: { regexp: /^lib\/(.*)$/u, template: "test/$1" },
      exclude: { regexp: /^\./u },
    },
  ],
]);

export const mainAsync = async (options) => {
  options = {
    layout: null,
    "exclude-regexp": default_exclude_regexp,
    "exclude-regexp-flags": default_regexp_flags,
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
    argv: [],
    "main-var": default_main_var,
    "test-var": default_test_var,
    _: [],
    ...options,
  };
  if (!isArray(options.argv)) {
    options.argv = [options.argv];
  }
  const {
    help,
    _: { length },
  } = options;
  if (length === 0) {
    log(makeHelpMessage(), "utf8");
    return help ? 0 : 1;
  } else {
    if (help) {
      log(makeHelpMessage(), "utf8")
    }
    const {
      timeout,
      _: [command, ...argv],
      "test-var": test_var,
      "main-var": main_var,
      target,
      stdio,
      layout,
      "ordering-filename": ordering,
      "memoization-path": path,
      "exclude-regexp": exclude_regexp_source,
      "exclude-regexp-flags": exclude_regexp_flags,
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
            createRegExpEither(exclude_regexp_source, exclude_regexp_flags),
            (regexp) => ({ regexp }),
          ),
          (exclude) =>
            mapRight(
              mapRight(
                createRegExpEither(format_regexp_source, format_regexp_flags),
                (regexp) => ({ regexp, template: format_template }),
              ),
              (format) => ({ exclude, format }),
            ),
        );
      } else {
        either = getMapEither(layouts, layout);
      }
      return mapRight(either, ({ format, exclude }) => ({
        format,
        exclude,
        memo,
      }));
    });
    either = await bindRightAsync(
      either,
      async ({ memo: memo1, format, exclude }) => {
        const { status, memo: memo2 } = await turtleAsync(target, memo1, {
          command,
          argv,
          test_var,
          main_var,
          cwd: target,
          stdio,
          timeout,
          ordering,
          exclude,
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

const makeHelpMessage = () => [
  "usage: npx test-turtle <command>",
  "  <command>",
  "      The file to execute for each test.",
  "      For instance: '/bin/sh'",
  "  --argv",
  "      The arguments to send to the executable file.",
  "      For instance:",
  "        - '-c'",
  "        - 'npx c8 --include $TURTLE_MAIN -- node $TURTLE_TEST'",
  "  --main-var",
  "      The name of the environment variable that will hold the relative",
  "      path to the main file.",
  `      Default: '${default_main_var}'.`,
  "  --test-var",
  "      The name of the environment variable that will hold the relative",
  "      path to the test file.",
  `      Default: '${default_test_var}'.`,
  "  --stdio",
  "      What to do with the command's stdio",
  `      Default: '${default_stdio}'`,
  "  --timeout",
  "      The number of millisecond before sending SIGTERM to the command.",
  "      One second later, SIGKILL will be send.",
  "      Default: 0 (no timeout)",
  "  --target",
  "      The root directory from which to start exploring.",
  '      Default: "."',
  "  --layout-filename",
  "      The name of the file indicating test layout.",
  `      Default: '${default_ordering_filename}'`,
  "  --memoization-path",
  "      The path to the file for reading and writing memoization data.",
  `      Default: '${default_memoization_path}'`,
  "  --layout",
  `      Use a predefined layout: ${stringify(from(layouts.keys()))}.`,
  "      This option overrides the '--format-*' and '--exclude-*' options.",
  "  --format-regexp",
  "      A regular expression to decompose the parts of a target's relative path.",
  "  --format-regexp-flags",
  "      The flags to use for --format-regexp",
  `      Default: "${default_regexp_flags}"`,
  "  --format-template",
  "      The template string to format the parts of the target file.",
  "  --exclude-regexp",
  "      Regular expression to exclude files from testing when no ordering",
  "      file is present in the directory.",
  `      Default: "${default_exclude_regexp}"`,
  "  --exclude-regexp-flags",
  "      The flags to use for --exclude-regexp.",
  `      Default: "${default_regexp_flags}`,
  "  --no-memoization",
  "      Disable memoization.",
  "  --help",
  "      Print this message.",
].join("\n");
