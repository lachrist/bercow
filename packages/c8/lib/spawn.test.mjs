import { equal as assertEqual, rejects as assertReject } from "node:assert";
import { spawnAsync } from "./spawn.mjs";

assertEqual(await spawnAsync("/bin/sh", "-c", "exit 0"), undefined);

assertReject(async () => await spawnAsync("/bin/sh", "-c", "exit 1"));

assertReject(async () => await spawnAsync("/bin/sh", "-c", "kill $$"));
