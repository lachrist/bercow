import {
  assertEqual,
  assertDeepEqual,
  getTemporaryPath,
} from "../test/fixture.mjs";

import { join as joinPath } from "node:path";
import {
  writeFile as writeFileAsync,
  readFile as readFileAsync,
  mkdir as mkdirAsync,
  rm as rmAsync,
} from "fs/promises";
import { bercowAsync } from "./api.mjs";

const home = getTemporaryPath();

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

const ordering = [
  joinPath(home, "file1"),
  joinPath(home, "directory", "file2"),
];

// initial //
{
  const trace = [];
  await bercowAsync(
    {
      link: (path, { log: _log, ...infos }) => {
        trace.push({ type: "link", path, infos });
        return [path];
      },
      lint: (file, { log: _log, ...infos }) => {
        trace.push({ type: "lint", file, infos });
        return file.content;
      },
      test: (files, { log: _log, ...infos }) => {
        trace.push({ type: "test", files, infos });
      },
    },
    home,
  );

  assertDeepEqual(trace, [
    {
      type: "link",
      path: joinPath(home, "file1"),
      infos: { index: 0, ordering },
    },

    {
      type: "lint",
      file: {
        path: joinPath(home, "file1"),
        content: "content1",
      },
      infos: { index: 0, ordering },
    },

    {
      type: "test",
      files: [
        {
          path: joinPath(home, "file1"),
          content: "content1",
        },
      ],
      infos: { index: 0, ordering },
    },

    {
      type: "link",
      path: joinPath(home, "directory", "file2"),
      infos: { index: 1, ordering },
    },
    {
      type: "lint",
      file: {
        path: joinPath(home, "directory", "file2"),
        content: "content2",
      },
      infos: { index: 1, ordering },
    },
    {
      type: "test",
      files: [
        {
          path: joinPath(home, "directory", "file2"),
          content: "content2",
        },
      ],
      infos: { index: 1, ordering },
    },
  ]);
}

// memoization //
await bercowAsync({}, home);

// change //
await writeFileAsync(joinPath(home, "file1"), "content3", "utf8");
await bercowAsync(
  {
    lint: ({ content }, _ordering) => `lint-${content}`,
  },
  home,
);

assertEqual(
  await readFileAsync(joinPath(home, "file1"), "utf8"),
  "lint-content3",
);

assertEqual(
  await readFileAsync(joinPath(home, "directory", "file2"), "utf8"),
  "content2",
);

await rmAsync(home, { recursive: true });
