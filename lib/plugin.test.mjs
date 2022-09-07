import {
  assertEqual,
  assertDeepEqual,
  getTemporaryPath,
} from "../test/fixture.mjs";
import { writeFileSync as writeFile } from "node:fs";
import { loadPluginAsync, combinePluginArray } from "./plugin.mjs";

const path = `${getTemporaryPath()}.mjs`;

writeFile(
  path,
  `
    import {equal as assertEqual} from "node:assert";
    export default async (options, home) => {
      assertEqual(options, "options");
      assertEqual(home, "/home");
      return {
        test: async () => {},
      };
    }
  `,
  "utf8",
);

assertEqual(
  await (await loadPluginAsync(path, "options", "/home")).test(),
  undefined,
);

// nothing //
{
  const { link, lint, test } = combinePluginArray([]);
  assertDeepEqual(await link("path", []), ["path"]);
  assertEqual(await lint({ path: "path", content: "content" }, []), "content");
  assertEqual(await test([], []), undefined);
}

// single //
{
  const { link, lint, test } = combinePluginArray([
    {
      link: (_path, _ordering) => [`link-path`],
      lint: async ({ content }, _ordering) => `lint-${content}`,
      test: async (_files, _ordering) => {},
    },
  ]);
  assertDeepEqual(await link("path", []), ["link-path"]);
  assertEqual(
    await lint({ path: "path", content: "content" }, []),
    "lint-content",
  );
  assertEqual(await test([], []), undefined);
}

// combine //
{
  const { link, lint, test } = combinePluginArray([
    {
      link: async (path, _ordering) => [`link1-${path}`],
      lint: async ({ content }, _ordering) => `lint1-${content}`,
      test: async (_files, _ordering) => {},
    },
    {
      link: async (path, _ordering) => [`link2-${path}`],
      lint: async ({ content }, _ordering) => `lint2-${content}`,
      test: async (_files, _ordering) => {},
    },
  ]);
  assertDeepEqual(await link("path", []), ["link1-path", "link2-path"]);
  assertEqual(
    await lint({ path: "path", content: "content" }, []),
    "lint2-lint1-content",
  );
  assertEqual(await test([], []), undefined);
}
