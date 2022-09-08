/* eslint-env node */

import { equal as assertEqual } from "node:assert";
import { join as joinPath } from "node:path";
import plugin from "./index.mjs";

const file = {
  path: joinPath(process.cwd(), "file.mjs"),
  content: "{ 123; }",
};

{
  const { lint } = await plugin(
    { "prettier-options": { tabWidth: 0 } },
    "/home",
  );
  assertEqual(await lint(file, []), "{\n123;\n}\n");
}

{
  const { lint } = await plugin({}, "/home");
  assertEqual(await lint(file, []), "{\n  123;\n}\n");
}

{
  const { lint } = await plugin(
    { "prettier-options": "prettierrc.yaml" },
    process.cwd(),
  );
  assertEqual(await lint(file, []), "{\n  123;\n}\n");
}
