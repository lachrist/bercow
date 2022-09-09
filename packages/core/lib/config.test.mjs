import {
  getTemporaryPath,
  assertEqual,
  assertThrow,
} from "../../../test/fixture.mjs";
import {
  writeFileSync as writeFile,
  mkdirSync as mkdir,
  rmSync as rm,
} from "node:fs";
import { join as joinPath } from "node:path";
import {
  getDefaultConfig,
  resolveConfig,
  resolveConfigPath,
  loadConfig,
} from "./config.mjs";

const {
  JSON: { stringify: stringifyJSON },
} = global;

const home = getTemporaryPath();

mkdir(home);

assertThrow(
  () => resolveConfigPath(null, home),
  /^Error: Could not find bercow configuration file/u,
);

writeFile(
  joinPath(home, ".bercowrc.json"),
  stringifyJSON({ "target-directory": "./json" }),
  "utf8",
);

writeFile(joinPath(home, ".bercowrc"), "target-directory: ./yaml", "utf8");

const test = (maybe) =>
  resolveConfig(
    {
      ...getDefaultConfig(),
      ...loadConfig(resolveConfigPath(maybe, home), "utf8"),
    },
    home,
  )["target-directory"];

assertEqual(test(null), joinPath(home, "json"));

assertEqual(test(".bercowrc"), joinPath(home, "yaml"));

rm(home, { recursive: true });
