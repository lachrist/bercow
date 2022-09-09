import {
  getTemporaryPath,
  assertThrow,
  assertEqual,
} from "../../../test/fixture.mjs";
import { writeFileSync as writeFile, unlinkSync as unlink } from "node:fs";
import { Buffer } from "node:buffer";
import { assert, mapMaybe, fromMaybe, readFileMaybe } from "./util.mjs";

const { from: toBuffer } = Buffer;

assertThrow(() => assert(false, "message"));

assertEqual(
  mapMaybe(null, () => {
    throw new Error("deadcode");
  }),
  null,
);

assertEqual(
  mapMaybe("foo", (just) => `${just}bar`),
  "foobar",
);

assertEqual(fromMaybe(123, 456), 123);

assertEqual(fromMaybe(null, 123), 123);

{
  const path = `${getTemporaryPath()}.json`;
  assertEqual(readFileMaybe(path), null);
  writeFile(path, toBuffer("content", "utf8"));
  assertEqual(readFileMaybe(path).toString("utf8"), "content");
  unlink(path);
}
