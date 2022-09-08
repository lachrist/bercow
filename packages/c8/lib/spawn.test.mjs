import { equal as assertEqual, rejects as assertReject } from "node:assert";
import { spawnAsync } from "./spawn.mjs";

const logParagraph = (_paragraph) => {};

assertEqual(
  await spawnAsync(logParagraph, "/bin/sh", "-c", "echo FOO"),
  undefined,
);

assertReject(
  async () => await spawnAsync(logParagraph, "/bin/sh", "-c", "exit 1"),
);

assertReject(
  async () => await spawnAsync(logParagraph, "/bin/sh", "-c", "kill $$"),
);
