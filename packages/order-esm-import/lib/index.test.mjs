import { assertEqual, assertRejectAsync } from "../../../test/fixture.mjs";
import { format as formatPrettier } from "prettier";
import plugin from "./index.mjs";

const testAsync = async (content, options, infos) => {
  const { lint } = await plugin(options, "/home");
  return await lint(
    {
      path: "main.mjs",
      content,
    },
    {
      index: 0,
      ordering: ["main.mjs"],
      logTitle: (_title) => {},
      logSubtitle: (_subtitle) => {},
      logParagraph: (_paragraph) => {},
      ...infos,
    },
  );
};

// import statement not in head //
await assertRejectAsync(
  testAsync(`123; export {field} from "package";`, {}, {}),
  /^Error: Import statement should appear before any other statements/u,
);

// imported untested file //
await assertRejectAsync(
  testAsync(
    `import "./dep.mjs";`,
    {},
    {
      index: 0,
      ordering: ["main.mjs", "dep.mjs"],
    },
  ),

  /^Error: File should not be imported before being tested/u,
);

// ordering mismatch //
await assertRejectAsync(
  testAsync(
    `import "./dep2.mjs"; import "./dep1.mjs";`,
    { fix: false },
    {
      index: 2,
      ordering: ["dep1.mjs", "dep2.mjs", "main.mjs"],
    },
  ),

  /^Error: Ordering mismatch/,
);

// missing ordering mismatch //
await assertRejectAsync(
  testAsync(
    `import "./dep.mjs"; import "package";`,
    { fix: false },
    {
      index: 2,
      ordering: ["dep.mjs", "main.mjs"],
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
        ordering: ["dep.mjs", "main.mjs"],
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
        ordering: ["dep.mjs", "main.mjs"],
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
          ordering: ["dep.mjs", "main.mjs"],
        },
      ),
      { filepath: "main.mjs" },
    ),
    formatPrettier(`import "package"; import "./dep.mjs";`, {
      filepath: "main.mjs",
    }),
  );
}
