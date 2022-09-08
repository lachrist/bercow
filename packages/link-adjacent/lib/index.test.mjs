import { deepEqual as assertDeepEqual } from "node:assert";
import plugin from "./index.mjs";

const { link } = await plugin(
  {
    "additional-extension": "add-ext",
    "final-extension": "new-ext",
  },
  "/home",
);

assertDeepEqual(await link("/home/file.ext"), [
  "/home/file.ext",
  "/home/file.add-ext.new-ext",
]);
