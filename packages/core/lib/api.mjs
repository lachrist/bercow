import { resolve as resolvePath } from "node:path";
import * as Log from "./log.mjs";
import { makeHashing, hashChunkArray } from "./hash.mjs";
import { loadFile, saveFile, cleanupFile, hashFile } from "./file.mjs";
import {
  makeCache,
  updateCache,
  resetCache,
  readCache,
  openCache,
  closeCache,
} from "./cache.mjs";
import { linkNothing, lintNothing, testNothing } from "./plugin.mjs";
import { loadOrdering } from "./ordering.mjs";

const default_options = {
  clean: false,
  deny: linkNothing,
  link: linkNothing,
  lint: lintNothing,
  test: testNothing,
  encoding: "utf8",
  "target-directory": ".",
  "cache-separator": "\n",
  "lint-cache-file": "tmp/bercow-lint.txt",
  "test-cache-file": "tmp/bercow-test.txt",
  "ordering-filename": ".ordering",
  "ordering-pattern": null,
  "ordering-separator": "\n",
  "hash-algorithm": "sha256",
  "hash-input-encoding": "utf8",
  "hash-output-encoding": "base64",
  "hash-separator": "\0",
};

const linkAsync = async (path, infos, context) =>
  await context.link(path, infos);

const lintAsync = async (path, infos, context) => {
  const file = loadFile(path, context.hashing, context.encoding);
  if (!context.achievements.has(hashFile(file))) {
    saveFile(file, await context.lint(cleanupFile(file), infos));
    if (!context.achievements.has(hashFile(file))) {
      context.achievements.add(hashFile(file));
      updateCache(context.lint_cache, hashFile(file));
    }
  }
  return file;
};

const testAsync = async (files, infos, context) => {
  const hash = hashChunkArray(files.map(hashFile), context.hashing);
  let step = context.iterator.next();
  if (step.value !== hash) {
    while (!step.done) {
      step = context.iterator.next();
    }
    await context.test(files.map(cleanupFile), infos);
  }
  updateCache(context.test_cache, hash);
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

  if (options.clean) {
    resetCache(lint_cache);
    resetCache(test_cache);
  }

  const ordering = loadOrdering(
    resolvePath(home, options["target-directory"]),
    options["ordering-filename"],
    options["ordering-pattern"],
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
    hashing,
    lint_cache,
    test_cache,
    achievements: new Set(lints),
    iterator: tests[Symbol.iterator](),
  };

  try {
    const { length } = ordering;
    for (let index = 0; index < length; index += 1) {
      const path = ordering[index];
      const infos = { index, ordering, ...Log };
      const files = [];
      for (const link_path of await linkAsync(path, infos, context)) {
        files.push(await lintAsync(link_path, infos, context));
      }
      await testAsync(files, infos, context);
    }
  } finally {
    closeCache(lint_cache);
    closeCache(test_cache);
  }
};
