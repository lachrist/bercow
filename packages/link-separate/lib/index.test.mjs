import { deepEqual as assertDeepEqual } from "node:assert";
import plugin from "./index.mjs";

const { link } = await plugin({}, "/home");

assertDeepEqual(await link("/home/directory/file.ext"), [
  "/home/directory/file.ext",
  "/home/test/directory/file.ext",
]);
