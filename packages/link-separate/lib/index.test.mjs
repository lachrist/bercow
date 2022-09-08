import { deepEqual as assertDeepEqual } from "node:assert";
import plugin from "./index.mjs";

const infos = {
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