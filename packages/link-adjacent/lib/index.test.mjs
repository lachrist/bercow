import { deepEqual as assertDeepEqual } from "node:assert";
import plugin from "./index.mjs";

const infos = {
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
  "/home",
);

assertDeepEqual(await link("/home/file.ext", infos), [
  "/home/file.ext",
  "/home/file.add-ext.new-ext",
]);