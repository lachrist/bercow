/* eslint-env node */

import { equal as assertEqual, rejects as assertReject } from "node:assert";
import { join as joinPath } from "node:path";
import plugin from "./index.mjs";

const { lint } = await plugin({}, process.cwd());

await assertReject(
  lint(
    {
      path: joinPath(process.cwd(), "file.mjs"),
      content: "missing_global;",
    },
    [],
  ),
);

assertEqual(
  await lint(
    {
      path: joinPath(process.cwd(), "file.mjs"),
      content: "123;",
    },
    [],
  ),
  "123;",
);
