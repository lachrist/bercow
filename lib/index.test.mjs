// import {
//   deepEqual as assertDeepEqual,
//   equal as assertEqual,
// } from "node:assert";
import {
  writeFile as writeFileAsync,
  mkdir as mkdirAsync,
  rm as rmAsync,
} from "fs/promises";
import { tmpdir as getTmpdir } from "node:os";
import { join as joinPath } from "node:path";

import { testTurtle as testTurtleAsync } from "./list.mjs";

const root = joinPath(
  getTmpdir(),
  `test_turtle_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2)}`,
);

const config = {
  root,
  link: (path) => [path],
  lint: (file) => file,
  test: (files) => {
    files;
  },
  "ordering-filename": ".ordering",
};

await mkdirAsync(root);

await mkdirAsync(joinPath(root, "dir"));

await writeFileAsync(joinPath(root, "file1"), "content1", "utf8");

await writeFileAsync(joinPath(root, "directory", "file2"), "content2");

await writeFileAsync(joinPath(root, ".ordering"), "file1\ndirectory\n", "utf8");

await writeFileAsync(
  joinPath(root, "directory", ".ordering"),
  "file2\n",
  "utf8",
);

await testTurtleAsync(config);

await rmAsync(root, { recursive: true });
