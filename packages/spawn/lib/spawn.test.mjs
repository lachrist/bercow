import { assertEqual, assertReject } from "../../../test/fixture.mjs";
import { spawnAsync } from "./spawn.mjs";

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
