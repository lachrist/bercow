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
      link: (path, ordering) => {
        trace.push({ type: "link", path, ordering });
        return [path];
      },
      lint: (file, ordering) => {
        trace.push({ type: "lint", file, ordering });
        return file.content;
      },
      test: (files, ordering) => {
        trace.push({ type: "test", files, ordering });
      },
    },

    home,
  );

  assertDeepEqual(trace, [
    {
      type: "link",
      path: joinPath(home, "file1"),
      ordering,
    },

    {
      type: "lint",
      file: {
        path: joinPath(home, "file1"),
        content: "content1",
      },
      ordering,
    },

    {
      type: "test",
      files: [
        {
          path: joinPath(home, "file1"),
          content: "content1",
        },
      ],
      ordering,
    },

    {
      type: "link",
      path: joinPath(home, "directory", "file2"),
      ordering,
    },
    {
      type: "lint",
      file: {
        path: joinPath(home, "directory", "file2"),
        content: "content2",
      },
      ordering,
    },
    {
      type: "test",
      files: [
        {
          path: joinPath(home, "directory", "file2"),
          content: "content2",
        },
      ],
      ordering,
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
