import { assertEqual, assertReject } from "../../../test/fixture.mjs";
import { spawnAsync } from "./spawn.mjs";
import { platform } from "node:os";

const logParagraph = (_paragraph) => {};

const options = {};

const shell = platform() === "win32" ? "powershell" : "/bin/sh";

assertEqual(
  await spawnAsync(logParagraph, shell, ["-c", "echo FOO"], options),
  undefined,
);

assertReject(
  async () =>
    await spawnAsync(logParagraph, shell, ["-c", "exit 1"], options),
);

assertReject(
  async () =>
    await spawnAsync(logParagraph, shell, ["-c", "kill $$"], options),
);
