/* eslint-env node */

import { assertEqual } from "../../../test/fixture.mjs";
import { join as joinPath } from "node:path";
import plugin from "./index.mjs";

const cwd = process.cwd();

const infos = {
  cwd,
  index: 0,
  ordering: [],
  logTitle: (_title) => {},
  logSubtitle: (_subtitle) => {},
  logParagraph: (_paragraph) => {},
};

const file = {
  path: joinPath(cwd, "file.mjs"),
  content: "{ 123; }",
};

{
  const { lint } = await plugin({ "prettier-options": { tabWidth: 0 } }, cwd);
  assertEqual(await lint(file, infos), "{\n123;\n}\n");
}

{
  const { lint } = await plugin({}, cwd);
  assertEqual(await lint(file, infos), "{\n  123;\n}\n");
}

{
  const { lint } = await plugin({ "prettier-options": "prettierrc.yaml" }, cwd);
  assertEqual(await lint(file, infos), "{\n  123;\n}\n");
}
