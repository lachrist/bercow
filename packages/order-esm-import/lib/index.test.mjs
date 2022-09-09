import { join as joinPath } from "node:path";
import { assertEqual, assertReject } from "../../../test/fixture.mjs";
import { format as formatPrettier } from "prettier";
import plugin from "./index.mjs";

const cwd = process.cwd();

const testAsync = async (content, options, infos) => {
  const { lint } = await plugin(options, "/home");
  return await lint(
    {
      path: joinPath(cwd, "main.mjs"),
      content,
    },
    {
      cwd,
      index: 0,
      ordering: [joinPath(cwd, "main.mjs")],
      logTitle: (_title) => {},
      logSubtitle: (_subtitle) => {},
      logParagraph: (_paragraph) => {},
      ...infos,
    },
  );
};

// import statement not in head //
await assertReject(
  testAsync(`123; export {field} from "package";`, {}, {}),
  /^Error: Import statement should appear before any other statements/u,
);

// imported untested file //
await assertReject(
  testAsync(
    `import "./dep.mjs";`,
    {},
    {
      index: 0,
      ordering: [joinPath(cwd, "main.mjs"), joinPath(cwd, "dep.mjs")],
    },
  ),

  /^Error: File should not be imported before being tested/u,
);

// ordering mismatch //
await assertReject(
  testAsync(
    `import "./dep2.mjs"; import "./dep1.mjs";`,
    { fix: false },
    {
      index: 2,
      ordering: [
        joinPath(cwd, "dep1.mjs"),
        joinPath(cwd, "dep2.mjs"),
        joinPath(cwd, "main.mjs"),
      ],
    },
  ),

  /^Error: Ordering mismatch/,
);

// missing ordering mismatch //
await assertReject(
  testAsync(
    `import "./dep.mjs"; import "package";`,
    { fix: false },
    {
      index: 2,
      ordering: [joinPath(cwd, "dep.mjs"), joinPath(cwd, "main.mjs")],
    },
  ),

  /^Error: Ordering mismatch/,
);

// success //
{
  const content = `import "package"; import "./dep.mjs";`;
  assertEqual(
    await testAsync(
      content,
      { fix: false },
      {
        index: 2,
        ordering: [joinPath(cwd, "dep.mjs"), joinPath(cwd, "main.mjs")],
      },
    ),

    content,
  );
}

// fix >> no change //
{
  const content = `import "package"; import "./dep.mjs";`;
  assertEqual(
    await testAsync(
      content,
      { fix: true },
      {
        index: 2,
        ordering: [joinPath(cwd, "dep.mjs"), joinPath(cwd, "main.mjs")],
      },
    ),

    content,
  );
}

// fix >> change //
{
  assertEqual(
    formatPrettier(
      await testAsync(
        `import "./dep.mjs"; import "package";`,
        { fix: true },
        {
          index: 2,
          ordering: [joinPath(cwd, "dep.mjs"), joinPath(cwd, "main.mjs")],
        },
      ),
      { filepath: joinPath(cwd, "main.mjs") },
    ),
    formatPrettier(`import "package"; import "./dep.mjs";`, {
      filepath: joinPath(cwd, "main.mjs"),
    }),
  );
}
