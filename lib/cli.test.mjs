import { equal as assertEqual, rejects as assertReject } from "node:assert";
import {
  writeFile as writeFileAsync,
  readFile as readFileAsync,
  mkdir as mkdirAsync,
  rm as rmAsync,
} from "fs/promises";
import { tmpdir as getTmpdir } from "node:os";
import { join as joinPath } from "node:path";
import { dump as stringifyYAML } from "js-yaml";
import { runBercowAsync } from "./cli.mjs";

const { stringify: stringifyJSON } = JSON;

const home = joinPath(
  getTmpdir(),
  `test_turtle_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2)}`,
);

await mkdirAsync(home);

assertEqual(await runBercowAsync(["foo", "bar", "qux"], home), 1);

await writeFileAsync(
  joinPath(home, ".bercow.json"),
  stringifyJSON({ plugins: { [joinPath(home, "plugin.mjs")]: null } }),
  "utf8",
);

await assertReject(async () => await runBercowAsync([".bercow.json"], home));

await writeFileAsync(
  joinPath(home, ".bercow.yaml"),
  stringifyYAML({ plugins: { "./plugin.mjs": "options" } }),
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
        lint: async ({content}, _ordering) => "linted-" + content,
      };
    };
  `,
  "utf8",
);

await writeFileAsync(joinPath(home, ".ordering"), "foo\n", "utf8");

await writeFileAsync(joinPath(home, "foo"), "content", "utf8");

assertEqual(await runBercowAsync([".bercow.yaml"], home), 0);

assertEqual(
  await readFileAsync(joinPath(home, "foo"), "utf8"),
  "linted-content",
);

await rmAsync(home, { recursive: true });
