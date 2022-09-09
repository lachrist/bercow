import { join as joinPath } from "node:path";
import { assertDeepEqual } from "../../../test/fixture.mjs";
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

const { link } = await plugin(
  {
    "additional-extension": "add-ext",
    "final-extension": "new-ext",
  },
  cwd,
);

assertDeepEqual(await link(joinPath(cwd, "file.ext"), infos), [
  joinPath(cwd, "file.ext"),
  joinPath(cwd, "file.add-ext.new-ext"),
]);
