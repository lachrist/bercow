import { assertDeepEqual } from "../../../test/fixture.mjs";
import plugin from "./index.mjs";

const infos = {
  index: 0,
  ordering: [],
  logTitle: (_title) => {},
  logSubtitle: (_subtitle) => {},
  logParagraph: (_paragraph) => {},
};

const { link } = await plugin({
  "additional-extension": "add-ext",
  "final-extension": "new-ext",
});

assertDeepEqual(await link("file.ext", infos), [
  "file.ext",
  "file.add-ext.new-ext",
]);
