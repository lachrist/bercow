import {
  assertEqual,
  assertDeepEqual,
  makeTempDirAsync,
} from "../../../test/fixture.mjs";
import {
  writeFile as writeFileAsync,
  readFile as readFileAsync,
} from "node:fs/promises";
import {
  loadFileAsync,
  cleanupFile,
  hashFile,
  saveFileAsync,
} from "./file.mjs";

const path = `${await makeTempDirAsync()}/file.txt`;

await writeFileAsync(path, "content", "utf8");

const file = await loadFileAsync(path, {
  encoding: "utf8",
  "hash-algorithm": "sha256",
  "hash-input-encoding": "utf8",
  "hash-output-encoding": "base64",
});

assertDeepEqual(cleanupFile(file), { path, content: "content" });

assertEqual(hashFile(file), hashFile(file));

await saveFileAsync(file, "CONTENT");

assertDeepEqual(cleanupFile(file), { path, content: "CONTENT" });

assertEqual(await readFileAsync(path, "utf8"), "CONTENT");
