import {
  deepEqual as assertDeepEqual,
  // equal as assertEqual,
} from "node:assert";
import { rm as rmAsync } from "fs/promises";
import { tmpdir as getTmpdir } from "node:os";
import { join as joinPath } from "node:path";

import { loadListAsync, saveListEntryAsync } from "./list.mjs";

const root = joinPath(
  getTmpdir(),
  `test_turtle_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2)}`,
);

const path = joinPath(root, "list.txt");

assertDeepEqual(await loadListAsync(path, "utf8"), []);

await saveListEntryAsync(path, "entry", "utf8");

await saveListEntryAsync(path, "entry\n", "utf8");

assertDeepEqual(await loadListAsync(path, "utf8"), ["entry", "entry\n"]);

await rmAsync(root, { recursive: true });
