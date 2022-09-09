/* eslint-env node */

import { assertEqual, assertReject } from "../../../test/fixture.mjs";
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

const { lint } = await plugin({}, process.cwd());

await assertReject(
  lint(
    {
      path: joinPath(process.cwd(), "file.mjs"),
      content: "missing_global;",
    },
    infos,
  ),
);

assertEqual(
  await lint(
    {
      path: joinPath(process.cwd(), "file.mjs"),
      content: "123;",
    },
    infos,
  ),
  "123;",
);
