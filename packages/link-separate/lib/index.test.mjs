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

const { link } = await plugin({}, cwd);

assertDeepEqual(await link(joinPath(cwd, "dir", "file.ext"), infos), [
  joinPath(cwd, "dir", "file.ext"),
  joinPath(cwd, "test", "dir", "file.ext"),
]);
