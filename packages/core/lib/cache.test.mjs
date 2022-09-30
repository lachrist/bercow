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
  createCacheAsync,
  readCacheAsync,
  openCacheAsync,
  closeCacheAsync,
  resetCacheAsync,
  appendCache,
} from "./cache.mjs";

const path = `${await makeTempDirAsync()}/cache.txt`;

const cache = await createCacheAsync(path, {
  "cache-separator": "-",
  encoding: "utf8",
});

assertDeepEqual(await readCacheAsync(cache), []);

await writeFileAsync(path, `entry1-entry2-`, "utf8");

assertDeepEqual(await readCacheAsync(cache), ["entry1", "entry2"]);

assertEqual(await openCacheAsync(cache), undefined);

appendCache(cache, "entry3");

assertEqual(await readFileAsync(path, "utf8"), `entry1-entry2-entry3-`);

assertEqual(await closeCacheAsync(cache), undefined);

await resetCacheAsync(cache);

await resetCacheAsync(cache);

assertDeepEqual(await readCacheAsync(cache), []);
