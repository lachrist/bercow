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

import { bercow as bercowAsync } from "./index.mjs";

const home = joinPath(
  getTmpdir(),
  `test_turtle_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2)}`,
);

const trace = [];

const config = {
  link: (path, ordering) => {
    trace.push({type: "link", path, ordering});
    return [path];
  },
  lint: (file, ordering) => {
    trace.push({type:"lint", file, ordering});
    return file.content;
  },
  test: (files, ordering) => {
    trace.push({type:"test", files, ordering});
  },
  "ordering-filename": ".ordering",
};

await mkdirAsync(home);

await mkdirAsync(joinPath(home, "directory"));

await writeFileAsync(joinPath(home, "file1"), "content1", "utf8");

await writeFileAsync(joinPath(home, "directory", "file2"), "content2", "utf8");

await writeFileAsync(joinPath(home, ".ordering"), "file1\ndirectory\n", "utf8");

await writeFileAsync(
  joinPath(home, "directory", ".ordering"),
  "file2\n",
  "utf8",
);

await bercowAsync(config, home);

console.log(trace);

// await testTurtleAsync(config);
//
// await writeFileAsync(joinPath(home, "file1"), "content3", "utf8");
//
// await testTurtleAsync({
//   ...config,
//   lint: (file) => toBuffer(`linted-${file.content}`, "utf8"),
// });
//
// assertEqual(
//   await readFileAsync(joinPath(cwd, "file1"), "utf8"),
//   "linted-content3",
// );
//
// assertEqual(
//   await readFileAsync(joinPath(cwd, "directory", "file2"), "utf8"),
//   "content2",
// );
//
// await rmAsync(cwd, { recursive: true });
