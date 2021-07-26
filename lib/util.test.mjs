import { strict as Assert } from "assert";
import {
  mapAsync,
  spawnAsync,
  logBlue,
  getArrayMaybe,
  identity,
} from "./util.mjs";

const {
  fail: assertFail,
  equal: assertEqual,
  deepEqual: assertDeepEqual,
} = Assert;

const testAsync = async () => {
  //   throws: assertThrows,
  // deepEqual: assertDeepEqual,
  // const {from} = Array;
  // assertThrows(() => execRegExp(/^foo$/, "bar"), /^Error: failed to match/);
  //
  // assertDeepEqual(from(execRegExp(/^(foo)(bar)$/, "foobar")), [
  //   "foobar",
  //   "foo",
  //   "bar",
  // ]);

  // identity //

  assertEqual(identity("foo"), "foo");

  // getArrayMaybe //

  assertEqual(getArrayMaybe(["foo"], 0), "foo");

  assertEqual(getArrayMaybe([], 0), null);

  // mapAsync //

  assertDeepEqual(await mapAsync(["foo"], (x) => Promise.resolve(x + "bar")), [
    "foobar",
  ]);

  // spawnAsync //

  assertEqual(await spawnAsync("/bin/sh", ["-c", "exit 0"], 0), null);

  try {
    await spawnAsync("/bin/sh", ["-c", "exit 123"], 0);
    assertFail();
  } catch ({ message }) {
    assertEqual(message, "command failure (123)");
  }

  // ["-c", "kill -KILL $$"]
  try {
    await spawnAsync("/bin/sh", ["-c", "sleep 2"], 1);
    assertFail();
  } catch ({ message }) {
    assertEqual(message, "command killed with SIGTERM");
  }

  // log //

  logBlue("foo");
};

testAsync();
