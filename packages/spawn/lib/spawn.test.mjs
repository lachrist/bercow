import { assertEqual, assertRejectAsync } from "../../../test/fixture.mjs";
import { platform } from "node:os";
import { spawnAsync } from "./spawn.mjs";

const logParagraph = (_paragraph) => {};

const options = {};

const shell = platform() === "win32" ? "powershell" : "/bin/sh";

assertEqual(
  await spawnAsync(logParagraph, shell, ["-c", "echo FOO"], options),
  undefined,
);

await assertRejectAsync(
  spawnAsync(logParagraph, shell, ["-c", "exit 1"], options),
);

await assertRejectAsync(
  spawnAsync(logParagraph, shell, ["-c", "kill $$"], options),
);
