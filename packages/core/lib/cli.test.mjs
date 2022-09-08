import { assertEqual, getTemporaryPath } from "../test/fixture.mjs";
import { join as joinPath } from "node:path";
import {
  writeFile as writeFileAsync,
  readFile as readFileAsync,
  mkdir as mkdirAsync,
  rm as rmAsync,
} from "fs/promises";
import { runBercowAsync } from "./cli.mjs";

const { stringify: stringifyJSON } = JSON;

const home = getTemporaryPath();

await mkdirAsync(home);

assertEqual(await runBercowAsync(["foo", "bar", "qux"], home), 1);

await writeFileAsync(
  joinPath(home, ".bercow.json"),
  stringifyJSON({ plugins: { "./plugin.mjs": "options" } }),
  "utf8",
);

await writeFileAsync(
  joinPath(home, "plugin.mjs"),
  `
    import { equal as assertEqual } from "node:assert";
    export default async (options, home) => {
      assertEqual(options, "options");
      assertEqual(home, ${JSON.stringify(home)});
      return {
        lint: async ({content}, _ordering) => "lint-" + content,
      };
    };
  `,
  "utf8",
);

await writeFileAsync(joinPath(home, ".ordering"), "foo\n", "utf8");

await writeFileAsync(joinPath(home, "foo"), "content", "utf8");

assertEqual(await runBercowAsync([".bercow.json", "utf8"], home), 0);

assertEqual(await readFileAsync(joinPath(home, "foo"), "utf8"), "lint-content");

await rmAsync(home, { recursive: true });
