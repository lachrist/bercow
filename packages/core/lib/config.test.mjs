import {
  makeTempDirAsync,
  assertEqual,
  assertDeepEqual,
  assertRejectAsync,
} from "../../../test/fixture.mjs";
import { writeFile as writeFileAsync, rm as rmAsync } from "node:fs/promises";
import { getDefaultConfig, loadConfigAsync } from "./config.mjs";

const {
  process: { chdir, cwd: getCwd },
  JSON: { stringify: stringifyJSON },
} = global;

assertEqual(typeof getDefaultConfig(), "object");

const home = await makeTempDirAsync();

const cwd = getCwd();

chdir(home);

await assertRejectAsync(
  loadConfigAsync(null),
  /^Error: Could not find bercow configuration file at /u,
);

await writeFileAsync(".bercowrc", "target-directory: yaml", "utf8");

assertDeepEqual(await loadConfigAsync(null), { "target-directory": "yaml" });

await writeFileAsync(
  ".bercowrc.json",
  stringifyJSON({ "target-directory": "json" }),
  "utf8",
);

assertDeepEqual(await loadConfigAsync(".bercowrc.json"), {
  "target-directory": "json",
});

chdir(cwd);

await rmAsync(home, { recursive: true });
