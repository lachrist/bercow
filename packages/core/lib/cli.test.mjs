import { assertEqual, makeTempDirAsync } from "../../../test/fixture.mjs";
import {
  writeFile as writeFileAsync,
  readFile as readFileAsync,
  rm as rmAsync,
} from "fs/promises";

const {
  process: { cwd: getCwd, chdir },
  JSON: { stringify: stringifyJSON },
} = global;

const home = await makeTempDirAsync();

const cwd = getCwd();

chdir(home);

const { runBercowAsync } = await import("./cli.mjs");

await writeFileAsync(
  ".bercow.json",
  stringifyJSON({ plugins: { "./plugin.mjs": "options" } }),
  "utf8",
);

await writeFileAsync(
  "plugin.mjs",
  `
    import { equal as assertEqual } from "node:assert";
    export default async (options) => {
      assertEqual(options, "options");
      return {
        lint: async ({content}, _infos) => "lint-" + content,
      };
    };
  `,
  "utf8",
);

await writeFileAsync(".ordering", "foo", "utf8");

await writeFileAsync("foo", "content", "utf8");

assertEqual(
  await runBercowAsync([".bercow.json", "utf8", "--help", "--version"], home),
  undefined,
);

assertEqual(await readFileAsync("foo", "utf8"), "lint-content");

chdir(cwd);

await rmAsync(home, { recursive: true });
