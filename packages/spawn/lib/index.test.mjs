import { equal as assertEqual, rejects as assertReject } from "node:assert";
import { spawnAsync } from "./index.mjs";

const logParagraph = (_paragraph) => {};

const options = {};

assertEqual(
  await spawnAsync(logParagraph, "/bin/sh", ["-c", "echo FOO"], options),
  undefined,
);

assertReject(
  async () =>
    await spawnAsync(logParagraph, "/bin/sh", ["-c", "exit 1"], options),
);

assertReject(
  async () =>
    await spawnAsync(logParagraph, "/bin/sh", ["-c", "kill $$"], options),
);
