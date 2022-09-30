import {
  assertEqual,
  assertDeepEqual,
  makeTempDirAsync,
} from "../../../test/fixture.mjs";
import { EOL } from "node:os";
import {
  writeFile as writeFileAsync,
  readFile as readFileAsync,
  mkdir as mkdirAsync,
  rm as rmAsync,
} from "fs/promises";
import { bercowAsync } from "./api.mjs";

const {
  process: { cwd: getCwd, chdir },
} = global;

const home = await makeTempDirAsync();

const cwd = getCwd();

chdir(home);

await mkdirAsync("directory");

await writeFileAsync("file1", "content1", "utf8");

await writeFileAsync("directory/file2", "content2", "utf8");

await writeFileAsync(".ordering", `file1${EOL}directory${EOL}`, "utf8");

await writeFileAsync("directory/.ordering", `file2${EOL}`, "utf8");

const ordering = ["file1", "directory/file2"];

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
      path: "file1",
      infos: { index: 0, ordering },
    },

    {
      type: "lint",
      file: {
        path: "file1",
        content: "content1",
      },
      infos: { index: 0, ordering },
    },

    {
      type: "test",
      files: [
        {
          path: "file1",
          content: "content1",
        },
      ],
      infos: { index: 0, ordering },
    },

    {
      type: "link",
      path: "directory/file2",
      infos: { index: 1, ordering },
    },
    {
      type: "lint",
      file: {
        path: "directory/file2",
        content: "content2",
      },
      infos: { index: 1, ordering },
    },
    {
      type: "test",
      files: [
        {
          path: "directory/file2",
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
    "lint-cache-file": "tmp/bercow-lint",
    "test-cache-file": "tmp/bercow-test",
  },
  home,
);
await bercowAsync({}, {}, home);
await bercowAsync({}, {}, home);

// change //
await writeFileAsync("file1", "content3", "utf8");
await bercowAsync(
  {
    lint: ({ content }, _ordering) => `lint-${content}`,
  },
  {},
  home,
);

assertEqual(await readFileAsync("file1", "utf8"), "lint-content3");

assertEqual(await readFileAsync("directory/file2", "utf8"), "content2");

chdir(cwd);

await rmAsync(home, { recursive: true });
