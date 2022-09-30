/* eslint-env node */

import { assertEqual } from "../../../test/fixture.mjs";
import plugin from "./index.mjs";

const infos = {
  index: 0,
  ordering: [],
  logTitle: (_title) => {},
  logSubtitle: (_subtitle) => {},
  logParagraph: (_paragraph) => {},
};

const file = {
  path: "file.mjs",
  content: "{ 123; }",
};

{
  const { lint } = await plugin({ "prettier-options": { tabWidth: 0 } });
  assertEqual(await lint(file, infos), "{\n123;\n}\n");
}

{
  const { lint } = await plugin({});
  assertEqual(await lint(file, infos), "{\n  123;\n}\n");
}

{
  const { lint } = await plugin({ "prettier-options": "prettierrc.yaml" });
  assertEqual(await lint(file, infos), "{\n  123;\n}\n");
}
