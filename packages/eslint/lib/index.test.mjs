/* eslint-env node */

import { assertEqual, assertRejectAsync } from "../../../test/fixture.mjs";
import plugin from "./index.mjs";

const infos = {
  index: 0,
  ordering: [],
  logTitle: (_title) => {},
  logSubtitle: (_subtitle) => {},
  logParagraph: (_paragraph) => {},
};

const { lint } = await plugin({}, process.cwd());

await assertRejectAsync(
  lint(
    {
      path: "file.mjs",
      content: "missing_global;",
    },
    infos,
  ),
);

assertEqual(
  await lint(
    {
      path: "file.mjs",
      content: "123;",
    },
    infos,
  ),
  "123;",
);
