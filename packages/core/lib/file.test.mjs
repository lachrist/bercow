import {
  assertEqual,
  assertDeepEqual,
  getTemporaryPath,
} from "../../../test/fixture.mjs";
import { writeFileSync as writeFile, readFileSync as readFile } from "node:fs";
import { makeHashing } from "./hash.mjs";
import { loadFile, cleanupFile, hashFile, saveFile } from "./file.mjs";

const path = getTemporaryPath();

writeFile(path, "content", "utf8");

const file = loadFile(
  path,
  makeHashing("sha256", "\0", "utf8", "utf8"),
  "utf8",
);

assertDeepEqual(cleanupFile(file), { path, content: "content" });

assertEqual(hashFile(file), hashFile(file));

saveFile(file, "CONTENT");

assertEqual(readFile(path, "utf8"), "CONTENT");
