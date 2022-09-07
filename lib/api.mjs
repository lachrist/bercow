import {
  join as joinPath,
  resolve as resolvePath,
  relative as relativizePath,
} from "node:path";
import { readFileSync as readFile, statSync as stat } from "node:fs";
import {
  makeCache,
  updateCache,
  resetCache,
  readCache,
  openCache,
  closeCache,
} from "./cache.mjs";
import { linkNothing, lintNothing, testNothing } from "./plugin.mjs";
import { loadFile, saveFile, cleanupFile, hashFile } from "./file.mjs";
import { makeHashing, hashChunkArray } from "./hash.mjs";
import { logColor } from "./log.mjs";

const default_options = {
  link: linkNothing,
  lint: lintNothing,
  test: testNothing,
  encoding: "utf8",
  "target-directory": ".",
  "cache-separator": "\n",
  "lint-cache-file": "tmp/bercow-lint.txt",
  "test-cache-file": "tmp/bercow-test.txt",
  "ordering-filename": ".ordering",
  "ordering-separator": "\n",
  "hash-algorithm": "sha256",
  "hash-input-encoding": "utf8",
  "hash-output-encoding": "base64",
  "hash-separator": "\0",
};

const isNotEmptyString = (any) => any !== "";

const extractOrdering = (path, filename, separator, encoding) => {
  if (stat(path).isDirectory()) {
    return readFile(joinPath(path, filename))
      .toString(encoding)
      .split(separator)
      .filter(isNotEmptyString)
      .flatMap((entry) =>
        extractOrdering(joinPath(path, entry), filename, separator, encoding),
      );
  } else {
    return [path];
  }
};

const linkAsync = async (path, context) =>
  await context.link(path, context.ordering);

const lintAsync = async (path, context) => {
  const file = loadFile(path, context.hashing, context.encoding);
  if (!context.achievements.has(hashFile(file))) {
    saveFile(file, await context.lint(cleanupFile(file), context.ordering));
    if (!context.achievements.has(hashFile(file))) {
      context.achievements.add(hashFile(file));
      updateCache(context.lint_cache, hashFile(file));
    }
  }
  return file;
};

const testAsync = async (files, context) => {
  const hash = hashChunkArray(files.map(hashFile), context.hashing);
  let step = context.iterator.next();
  let memoized = step.value === hash;
  if (!memoized) {
    while (!step.done) {
      step = context.iterator.next();
    }
    await context.test(files.map(cleanupFile), context.ordering);
  }
  updateCache(context.test_cache, hash);
  return memoized;
};

export const bercowAsync = async (options, home) => {
  options = {
    ...default_options,
    ...options,
  };
  const lint_cache = makeCache(
    resolvePath(home, options["lint-cache-file"]),
    options["cache-separator"],
    options.encoding,
  );
  const test_cache = makeCache(
    resolvePath(home, options["test-cache-file"]),
    options["cache-separator"],
    options.encoding,
  );
  const ordering = extractOrdering(
    resolvePath(home, options["target-directory"]),
    options["ordering-filename"],
    options["ordering-separator"],
    options.encoding,
  );
  const hashing = makeHashing(
    options["hash-algorithm"],
    options["hash-separator"],
    options["hash-input-encoding"],
    options["hash-output-encoding"],
  );
  const lints = readCache(lint_cache);
  const tests = readCache(test_cache);
  resetCache(test_cache);
  openCache(lint_cache);
  openCache(test_cache);
  const context = {
    link: options.link,
    lint: options.lint,
    test: options.test,
    encoding: options.encoding,
    ordering,
    hashing,
    lint_cache,
    test_cache,
    achievements: new Set(lints),
    iterator: tests[Symbol.iterator](),
  };
  try {
    for (const path of ordering) {
      logColor(`${relativizePath(process.cwd(), path)} ...${"\n"}`, "blue");
      const files = [];
      for (const link_path of await linkAsync(path, context)) {
        files.push(await lintAsync(link_path, context));
      }
      if (await testAsync(files, context)) {
        logColor("Memoized\n", "blue");
      } else {
        logColor("Success\n", "green");
      }
    }
  } finally {
    closeCache(lint_cache);
    closeCache(test_cache);
  }
};
