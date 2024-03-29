import {
  assertEqual,
  assertDeepEqual,
  makeTempDirAsync,
} from "../../../test/fixture.mjs";
import { writeFile as writeFileAsync } from "node:fs/promises";
import { loadPluginAsync, combinePluginArray } from "./plugin.mjs";

const path = `${await makeTempDirAsync()}/plugin.mjs`;

await writeFileAsync(
  path,
  `
    import {equal as assertEqual} from "node:assert";
    export default async (options) => {
      assertEqual(options, "options");
      return {
        test: async () => {},
      };
    }
  `,
  "utf8",
);

assertEqual(
  await (await loadPluginAsync(`./${path}`, "options")).test([], 0, []),
  undefined,
);

// nothing //
{
  const { link, lint, test } = combinePluginArray([]);
  assertDeepEqual(await link("path", 0, []), ["path"]);
  assertEqual(
    await lint({ path: "path", content: "content" }, 0, []),
    "content",
  );
  assertEqual(await test([], 0, []), undefined);
}

// single //
{
  const { link, lint, test } = combinePluginArray([
    {
      link: (_path, _infos) => [`link-path`],
      lint: async ({ content }, _infos) => `lint-${content}`,
      test: async (_files, _infos) => {},
    },
  ]);
  assertDeepEqual(await link("path", 0, []), ["link-path"]);
  assertEqual(
    await lint({ path: "path", content: "content" }, 0, []),
    "lint-content",
  );
  assertEqual(await test([], 0, []), undefined);
}

// combine //
{
  const { link, lint, test } = combinePluginArray([
    {
      link: async (path, _infos) => [`link1-${path}`],
      lint: async ({ content }, _infos) => `lint1-${content}`,
      test: async (_files, _infos) => {},
    },
    {
      link: async (path, _infos) => [`link2-${path}`],
      lint: async ({ content }, _infos) => `lint2-${content}`,
      test: async (_files, _infos) => {},
    },
  ]);
  assertDeepEqual(await link("path", 0, []), ["link1-path", "link2-path"]);
  assertEqual(
    await lint({ path: "path", content: "content" }, 0, []),
    "lint2-lint1-content",
  );
  assertEqual(await test([], 0, []), undefined);
}
