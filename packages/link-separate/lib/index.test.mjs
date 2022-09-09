import { assertDeepEqual } from "../../../test/fixture.mjs";
import plugin from "./index.mjs";

const infos = {
  cwd: "/cwd",
  index: 0,
  ordering: [],
  logTitle: (_title) => {},
  logSubtitle: (_subtitle) => {},
  logParagraph: (_paragraph) => {},
};

const { link } = await plugin({}, "/home");

assertDeepEqual(await link("/home/directory/file.ext", infos), [
  "/home/directory/file.ext",
  "/home/test/directory/file.ext",
]);
