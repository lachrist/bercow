import { strict as Assert } from "assert";
import { spawnAsync } from "./spawn.mjs";

(async () => {
  Assert.equal(true, await spawnAsync("/bin/sh", ["-c", "exit 0"]));
  Assert.equal(false, await spawnAsync("/bin/sh", ["-c", "exit 1"]));
  Assert.equal(false, await spawnAsync("/bin/sh", ["-c", "kill -KILL $$"]));
})().then(
  () => {},
  (error) => {
    throw error;
  },
);
