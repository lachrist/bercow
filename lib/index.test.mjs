import { equal as assertEqual } from "node:assert";
import {
  writeFile as writeFileAsync,
  readFile as readFileAsync,
  mkdir as mkdirAsync,
  rm as rmAsync,
} from "fs/promises";
import { tmpdir as getTmpdir } from "node:os";
import { join as joinPath } from "node:path";
import { Buffer } from "node:buffer";

const { from: toBuffer } = Buffer;

import { testTurtle as testTurtleAsync } from "./index.mjs";

const cwd = joinPath(
  getTmpdir(),
  `test_turtle_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2)}`,
);

const config = {
  cwd,
  link: (path) => [path],
  lint: (file) => file.content,
  test: (files) => {
    files;
  },
  "ordering-filename": ".ordering",
};

await mkdirAsync(cwd);

await mkdirAsync(joinPath(cwd, "directory"));

await writeFileAsync(joinPath(cwd, "file1"), "content1", "utf8");

await writeFileAsync(joinPath(cwd, "directory", "file2"), "content2", "utf8");

await writeFileAsync(joinPath(cwd, ".ordering"), "file1\ndirectory\n", "utf8");

await writeFileAsync(
  joinPath(cwd, "directory", ".ordering"),
  "file2\n",
  "utf8",
);

await testTurtleAsync(config);

await testTurtleAsync(config);

await writeFileAsync(joinPath(cwd, "file1"), "content3", "utf8");

await testTurtleAsync({
  ...config,
  lint: (file) => toBuffer(`linted-${file.content}`, "utf8"),
});

assertEqual(
  await readFileAsync(joinPath(cwd, "file1"), "utf8"),
  "linted-content3",
);

assertEqual(
  await readFileAsync(joinPath(cwd, "directory", "file2"), "utf8"),
  "content2",
);

await rmAsync(cwd, { recursive: true });
