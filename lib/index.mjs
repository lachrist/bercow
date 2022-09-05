import { join as joinPath, resolve as resolvePath } from "node:path";
import {
  unlink as unlinkAsync,
  readFile as readFileAsync,
  writeFile as writeFileAsync,
  stat as statAsync,
} from "node:fs/promises";
import Chalk from "chalk";
import { loadListAsync, saveListEntryAsync } from "./list.mjs";
import { hashFileArray } from "./hash.mjs";

export { spawnAsync } from "./spawn.mjs";

const { blue: blueChalk, green: greenChalk } = Chalk;

const default_config = {
  cwd: process.cwd(),
  "lint-cache-file": "tmp/test-turtle-lint.txt",
  "test-cache-file": "tmp/test-turtle-test.txt",
  "ordering-filename": ".ordering",
  encoding: "utf8",
  link: null,
  lint: null,
  test: null,
};

export const testTurtle = async (config) => {
  config = {
    ...default_config,
    ...config,
  };
  config["lint-cache-file"] = resolvePath(
    config.cwd,
    config["lint-cache-file"],
  );
  config["test-cache-file"] = resolvePath(
    config.cwd,
    config["test-cache-file"],
  );
  const lints = await loadListAsync(config["lint-cache-file"], config.encoding);
  const tests = await loadListAsync(config["test-cache-file"], config.encoding);
  try {
    await unlinkAsync(config["test-cache-file"]);
  } catch (error) {
    /* c8 ignore start */
    if (error.code !== "ENOENT") {
      throw error;
    }
    /* c8 ignore stop */
  }
  await visitDirectoryAsync(
    config.cwd,
    new Set(lints),
    tests[Symbol.iterator](),
    config,
  );
};

const lintAsync = async (path, hashes, config) => {
  const file = {
    path,
    content: await readFileAsync(path),
  };
  const hash = hashFileArray([file]);
  if (hashes.has(hash)) {
    return file;
  } else {
    const updated_file = {
      path,
      content: await config.lint(file),
    };
    const updated_hash = hashFileArray([updated_file]);
    if (updated_hash !== hash) {
      await writeFileAsync(path, updated_file.content);
    }
    if (!hashes.has(updated_hash)) {
      hashes.add(updated_hash);
      await saveListEntryAsync(
        config["lint-cache-file"],
        updated_hash,
        config.encoding,
      );
    }
    return updated_file;
  }
};

const testAsync = async (files, iterator, config) => {
  const hash = hashFileArray(files);
  let step = iterator.next();
  let memoized = step.value === hash;
  if (!memoized) {
    while (!step.done) {
      step = iterator.next();
    }
    await config.test(files);
  }
  await saveListEntryAsync(config["test-cache-file"], hash, config.encoding);
  return memoized;
};

const visitFileAsync = async (path, lints, iterator, config) => {
  console.log(blueChalk(`${path} ...`));
  const files = [];
  for (const resource of await config.link(path)) {
    files.push(await lintAsync(resource, lints, config));
  }
  if (await testAsync(files, iterator, config)) {
    console.log(blueChalk("Memoized"));
  } else {
    console.log(greenChalk("Success"));
  }
};

const visitDirectoryAsync = async (directory, lints, iterator, config) => {
  for (const filename of await loadListAsync(
    joinPath(directory, config["ordering-filename"]),
    config.encoding,
  )) {
    const path = joinPath(directory, filename);
    if ((await statAsync(path)).isDirectory()) {
      await visitDirectoryAsync(path, lints, iterator, config);
    } else {
      await visitFileAsync(path, lints, iterator, config);
    }
  }
};
