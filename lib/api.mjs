import {
  join as joinPath,
  resolve as resolvePath,
  relative as relativizePath,
  dirname as getDirectory,
} from "node:path";
import { createHash } from "node:crypto";
import {
  mkdirSync as mkdir,
  openSync as open,
  closeSync as close,
  unlinkSync as unlink,
  writeSync as write,
  writeFileSync as writeFile,
  readFileSync as readFile,
  statSync as stat,
} from "node:fs";
import { Buffer } from "node:buffer";
import { default as Chalk } from "chalk";

const { isArray } = Array;
const { alloc: allocBuffer, from: toBuffer } = Buffer;
const { blue: chalkBlue, green: chalkGreen } = Chalk;

const linkNothing = (path, _ordering) => [path];

const lintNothing = ({ content }, _ordering) => content;

const testNothing = (_files, _ordering) => {};

const default_options = {
  link: linkNothing,
  lint: lintNothing,
  test: testNothing,
  encoding: "utf8",
  "target-directory": ".",
  "cache-separator": "\n",
  "lint-cache-file": "tmp/test-turtle-lint.txt",
  "test-cache-file": "tmp/test-turtle-test.txt",
  "ordering-filename": ".ordering",
  "ordering-separator": "\n",
  "hash-algorithm": "sha256",
  "hash-input-encoding": "utf8",
  "hash-output-encoding": "base64",
  "hash-separator": "\0",
};

const removeFileHash = ({ path, content }) => ({ path, content });

const getFileHash = ({ hash }) => hash;

const readFileMissing = (path) => {
  try {
    return readFile(path);
  } catch (error) {
    /* c8 ignore start */ if (error.code !== "ENOENT") {
      throw error;
    } /* c8 ignore stop */ else {
      return allocBuffer(0);
    }
  }
};

const combineLink = (linkers) => async (path, progress) => {
  const paths = [];
  for (const link of linkers) {
    paths.push(...(await link(path, progress)));
  }
  return paths;
};

const combineLint =
  (linters) =>
  async ({ path, content }, progress) => {
    for (const lint of linters) {
      content = await lint({ path, content }, progress);
    }
    return content;
  };

const combineTest = (testers) => async (files, progress) => {
  for (const test of testers) {
    await test(files, progress);
  }
};

const compile = (either, nothing, combine) => {
  if (isArray(either)) {
    if (either.length === 0) {
      return nothing;
    } else if (either.length === 1) {
      return either[0];
    } else {
      return combine(either);
    }
  } else {
    return either;
  }
};

const isNotEmptyString = (any) => any !== "";

export const bercowAsync = async (options, home) => {
  options = {
    ...default_options,
    ...options,
  };
  const lint_cache_path = resolvePath(home, options["lint-cache-file"]);
  const test_cache_path = resolvePath(home, options["test-cache-file"]);
  mkdir(getDirectory(lint_cache_path), { recursive: true });
  mkdir(getDirectory(test_cache_path), { recursive: true });
  const lints = readFileMissing(lint_cache_path)
    .toString(options.encoding)
    .split(options["cache-separator"])
    .filter(isNotEmptyString);
  const tests = readFileMissing(test_cache_path)
    .toString(options.encoding)
    .split(options["cache-separator"])
    .filter(isNotEmptyString);
  try {
    unlink(test_cache_path);
  } catch (error) {
    /* c8 ignore start */
    if (error.code !== "ENOENT") {
      throw error;
    }
    /* c8 ignore stop */
  }
  const context = {
    link: compile(options.link, linkNothing, combineLink),
    lint: compile(options.lint, lintNothing, combineLint),
    test: compile(options.test, testNothing, combineTest),
    encoding: options.encoding,
    achievements: new Set(lints),
    todo: tests[Symbol.iterator](),
    done: [],
    lint_fd: open(lint_cache_path, "a"),
    test_fd: open(test_cache_path, "a"),
    cache_separator: options["cache-separator"],
    ordering_separator: options["ordering-separator"],
    ordering_filename: options["ordering-filename"],
    hash_algorithm: options["hash-algorithm"],
    hash_input_encoding: options["hash-input-encoding"],
    hash_output_encoding: options["hash-output-encoding"],
    hash_separator: options["hash-separator"],
  };
  try {
    await visitDirectoryAsync(
      resolvePath(options["target-directory"], home),
      context,
    );
  } finally {
    close(context.lint_fd);
    close(context.test_fd);
  }
};

const hashChunkArray = (chunks, context) => {
  const hashing = createHash(context.hash_algorithm);
  for (const chunk of chunks) {
    hashing.update(
      typeof chunk === "string"
        ? toBuffer(chunk, context.hash_input_encoding)
        : chunk,
    );
    hashing.update(context.hash_separator);
  }
  return hashing.digest().toString(context.hash_output_encoding);
};

const linkAsync = async (path, context) =>
  await context.link(path, context.done.slice());

const lintAsync = async (path, context) => {
  const buffer = readFile(path);
  const content = buffer.toString(context.encoding);
  const hash = hashChunkArray([path, buffer], context);
  if (context.achievements.has(hash)) {
    return { path, content, hash };
  } else {
    const new_content = await context.lint(
      { path, content },
      context.done.slice(),
    );
    const new_buffer = toBuffer(new_content, context.encoding);
    const new_hash = hashChunkArray([path, new_buffer], context);
    if (new_hash !== hash) {
      writeFile(path, new_buffer);
    }
    if (!context.achievements.has(new_hash)) {
      context.achievements.add(new_hash);
      write(
        context.lint_fd,
        toBuffer(`${new_hash}${context.cache_separator}`, context.encoding),
      );
    }
    return { path, content: new_content, hash: new_hash };
  }
};

const testAsync = async (files, context) => {
  const hash = hashChunkArray(files.map(getFileHash), context);
  let step = context.todo.next();
  let memoized = step.value === hash;
  for (const { path } of files) {
    context.done.push(path);
  }
  if (!memoized) {
    while (!step.done) {
      step = context.todo.next();
    }
    await context.test(files.map(removeFileHash), context.done.slice());
  }
  write(
    context.test_fd,
    toBuffer(`${hash}${context.cache_separator}`, context.encoding),
  );
  return memoized;
};

const visitFileAsync = async (path, context) => {
  write(
    1,
    toBuffer(
      chalkBlue(`${relativizePath(process.cwd(), path)} ...${"\n"}`),
      "utf8",
    ),
  );
  const files = [];
  for (const link_path of await linkAsync(path, context)) {
    files.push(await lintAsync(link_path, context));
  }
  if (await testAsync(files, context)) {
    write(1, toBuffer(chalkBlue("Memoized\n"), "utf8"));
  } else {
    write(1, toBuffer(chalkGreen("Success\n"), "utf8"));
  }
};

const visitDirectoryAsync = async (path, context) => {
  for (const filename of readFile(joinPath(path, context.ordering_filename))
    .toString(context.encoding)
    .split(context.ordering_separator)
    .filter(isNotEmptyString)) {
    const child_path = joinPath(path, filename);
    if (stat(child_path).isDirectory()) {
      await visitDirectoryAsync(child_path, context);
    } else {
      await visitFileAsync(child_path, context);
    }
  }
};
