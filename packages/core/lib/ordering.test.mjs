import {
  assertThrow,
  assertDeepEqual,
  getTemporaryPath,
} from "../../../test/fixture.mjs";
import { join as joinPath } from "node:path";
import { EOL } from "node:os";
import {
  writeFileSync as writeFile,
  mkdirSync as mkdir,
  rmSync as rm,
} from "node:fs";
import { loadOrdering } from "./ordering.mjs";

const home = getTemporaryPath();

mkdir(home);

mkdir(joinPath(home, "dir"));

writeFile(joinPath(home, "file1"), "content1", "utf8");

writeFile(joinPath(home, "dir", "file2"), "content2", "utf8");

writeFile(joinPath(home, "dir", "file3"), "content3", "utf8");

writeFile(joinPath(home, ".ordering"), `file1${EOL}dir${EOL}`, "utf8");

assertThrow(
  () => loadOrdering(home, ".ordering", null, EOL, "utf8"),
  /Error: Missing ordering file/u,
);

assertDeepEqual(loadOrdering(home, ".ordering", "^", EOL, "utf8"), [
  joinPath(home, "file1"),
  joinPath(home, "dir", "file2"),
  joinPath(home, "dir", "file3"),
]);

rm(home, { recursive: true });
