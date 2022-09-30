import {
  assertRejectAsync,
  assertDeepEqual,
  makeTempDirAsync,
} from "../../../test/fixture.mjs";
import {
  writeFile as writeFileAsync,
  mkdir as mkdirAsync,
  rm as rmAsync,
} from "node:fs/promises";
import { loadOrderingAsync } from "./ordering.mjs";

const home = await makeTempDirAsync();

const config = {
  "target-directory": home,
  encoding: "utf8",
  "ordering-separator": "\n",
  "ordering-filename": ".ordering",
  "ordering-ignore-filename": ".ordering-ignore",
};

await mkdirAsync(`${home}/dir`);

await writeFileAsync(`${home}/file1`, "content1", "utf8");

await writeFileAsync(`${home}/dir/file2`, "content2", "utf8");

await writeFileAsync(`${home}/dir/file3`, "content3", "utf8");

await writeFileAsync(`${home}/dir/file4`, "content4", "utf8");

await writeFileAsync(
  `${home}/.ordering`,
  ["  # comment  ", "\tfile1  ", "dir"].join("\n"),
  "utf8",
);

await writeFileAsync(`${home}/.ordering-ignore`, "*/file4", "utf8");

assertDeepEqual(await loadOrderingAsync(config), [
  `${home}/file1`,
  `${home}/dir/file2`,
  `${home}/dir/file3`,
]);

await writeFileAsync(`${home}/.ordering`, "file1\nfile1", "utf8");

await assertRejectAsync(
  loadOrderingAsync(config),
  /^Error: Duplicate ordering occurence of /u,
);

await rmAsync(home, { recursive: true });
