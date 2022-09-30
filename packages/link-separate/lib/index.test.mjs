import { assertDeepEqual } from "../../../test/fixture.mjs";
import plugin from "./index.mjs";

const infos = {
  index: 0,
  ordering: [],
  logTitle: (_title) => {},
  logSubtitle: (_subtitle) => {},
  logParagraph: (_paragraph) => {},
};

const { link } = await plugin({});

assertDeepEqual(await link("dir/file.ext", infos), [
  "dir/file.ext",
  "test/dir/file.ext",
]);
