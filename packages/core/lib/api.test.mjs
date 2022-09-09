import {
  assertEqual,
  assertDeepEqual,
  getTemporaryPath,
} from "../../../test/fixture.mjs";

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
      link: (path, { ordering, index }) => {
        trace.push({ type: "link", path, infos: { ordering, index } });
        return [path];
      },
      lint: (file, { ordering, index }) => {
        trace.push({ type: "lint", file, infos: { ordering, index } });
        return file.content;
      },
      test: (files, { ordering, index }) => {
        trace.push({ type: "test", files, infos: { ordering, index } });
      },
    },
    {},
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
await bercowAsync({}, { clean: true }, home);
await bercowAsync(
  {},
  {
    "lint-cache-file": "./tmp/bercow-lint",
    "test-cache-file": "./tmp/bercow-test",
  },
  home,
);
await bercowAsync({}, {}, home);
await bercowAsync({}, {}, home);

// change //
await writeFileAsync(joinPath(home, "file1"), "content3", "utf8");
await bercowAsync(
  {
    lint: ({ content }, _ordering) => `lint-${content}`,
  },
  {},
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
