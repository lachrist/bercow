/* eslint-env node */

import { equal as assertEqual } from "node:assert";
import { join as joinPath } from "node:path";
import plugin from "./index.mjs";

const infos = {
  cwd: "/cwd",
  index: 0,
  ordering: [],
  logTitle: (_title) => {},
  logSubtitle: (_subtitle) => {},
  logParagraph: (_paragraph) => {},
};

const file = {
  path: joinPath(process.cwd(), "file.mjs"),
  content: "{ 123; }",
};

{
  const { lint } = await plugin(
    { "prettier-options": { tabWidth: 0 } },
    "/home",
  );
  assertEqual(await lint(file, infos), "{\n123;\n}\n");
}

{
  const { lint } = await plugin({}, "/home");
  assertEqual(await lint(file, infos), "{\n  123;\n}\n");
}

{
  const { lint } = await plugin(
    { "prettier-options": "prettierrc.yaml" },
    process.cwd(),
  );
  assertEqual(await lint(file, infos), "{\n  123;\n}\n");
}
