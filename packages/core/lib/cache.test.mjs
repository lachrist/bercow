import {
  assertEqual,
  assertDeepEqual,
  getTemporaryPath,
} from "../../../test/fixture.mjs";
import { writeFileSync as writeFile, readFileSync as readFile } from "node:fs";
import {
  makeCache,
  readCache,
  openCache,
  closeCache,
  resetCache,
  updateCache,
} from "./cache.mjs";

const path = getTemporaryPath();

const cache = makeCache(path, "\n", "utf8");

assertDeepEqual(readCache(cache), []);

writeFile(path, "entry1\nentry2\n", "utf8");

assertDeepEqual(readCache(cache), ["entry1", "entry2"]);

assertEqual(openCache(cache), undefined);

updateCache(cache, "entry3");

assertEqual(readFile(path, "utf8"), "entry1\nentry2\nentry3\n");

assertEqual(closeCache(cache), undefined);

resetCache(cache);

resetCache(cache);

assertDeepEqual(readCache(cache), []);
