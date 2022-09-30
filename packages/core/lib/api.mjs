import { fromMaybe } from "./util.mjs";
import * as Log from "./log.mjs";
import { hash } from "./hash.mjs";
import {
  loadFileAsync,
  saveFileAsync,
  cleanupFile,
  hashFile,
} from "./file.mjs";
import {
  createCacheAsync,
  resetCacheAsync,
  readCacheAsync,
  openCacheAsync,
  closeCacheAsync,
  appendCache,
} from "./cache.mjs";
import { linkNothing, lintNothing, testNothing } from "./plugin.mjs";
import { loadOrderingAsync } from "./ordering.mjs";
import { getDefaultConfig } from "./config.mjs";

const {
  JSON: { stringify: stringifyJSON },
} = global;

const linkAsync = async (path, infos, context) =>
  await context.link(path, infos);

const lintAsync = async (path, infos, context) => {
  const file = await loadFileAsync(path, context.config);
  if (!context.achievements.has(hashFile(file))) {
    await saveFileAsync(file, await context.lint(cleanupFile(file), infos));
    if (!context.achievements.has(hashFile(file))) {
      context.achievements.add(hashFile(file));
      appendCache(context.lint_cache, hashFile(file));
    }
  }
  return file;
};

const testAsync = async (files, infos, context) => {
  const digest = hash(stringifyJSON(files.map(hashFile)), context.config);
  let step = context.iterator.next();
  if (step.value !== digest) {
    while (!step.done) {
      step = context.iterator.next();
    }
    await context.test(files.map(cleanupFile), infos);
  }
  appendCache(context.test_cache, digest);
};

export const bercowAsync = async (plugin, config) => {
  plugin = {
    link: linkNothing,
    lint: lintNothing,
    test: testNothing,
    ...plugin,
  };

  config = {
    ...getDefaultConfig(),
    ...config,
  };

  const ordering = await loadOrderingAsync(config);

  const digest = hash(stringifyJSON(config), config);

  const lint_cache = await createCacheAsync(
    fromMaybe(config["lint-cache-file"], `tmp/bercow-${digest}-lint.txt`),
    config,
  );

  const test_cache = await createCacheAsync(
    fromMaybe(config["test-cache-file"], `tmp/bercow-${digest}-test.txt`),
    config,
  );

  if (config.clean) {
    await resetCacheAsync(lint_cache);
    await resetCacheAsync(test_cache);
  }

  const lints = await readCacheAsync(lint_cache);
  const tests = await readCacheAsync(test_cache);
  await resetCacheAsync(test_cache);

  await openCacheAsync(lint_cache);
  await openCacheAsync(test_cache);

  const context = {
    ...plugin,
    config,
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
    await closeCacheAsync(lint_cache);
    await closeCacheAsync(test_cache);
  }
};
