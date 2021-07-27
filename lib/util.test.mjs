import { strict as Assert } from "assert";
import {
  mapAsync,
  spawnAsync,
  log,
  getMap,
  logBlue,
  getArrayMaybe,
  identity,
  format,
} from "./util.mjs";

const {
  throws: assertThrows,
  fail: assertFail,
  equal: assertEqual,
  deepEqual: assertDeepEqual,
} = Assert;

const testAsync = async () => {
  // format //

  assertThrows(() => format("foo", /^bar$/, ""), /^Error: (.*) does not match/);
  assertThrows(() => format("foobar", /bar/, ""), /^Error: (.*) only matches/);
  assertEqual(format("foobar", /(foo)(bar)/, "$1qux$2"), "fooquxbar");

  // identity //

  assertEqual(identity("foo"), "foo");

  // getMap //

  assertEqual(getMap(new Map([["foo", "bar"]]), "foo"), "bar");
  assertThrows(() => getMap(new Map([]), "foo"), /^Error: missing key/);

  // getArrayMaybe //

  assertEqual(getArrayMaybe(["foo"], 0), "foo");

  assertEqual(getArrayMaybe([], 0), null);

  // mapAsync //

  assertDeepEqual(await mapAsync(["foo"], (x) => Promise.resolve(x + "bar")), [
    "foobar",
  ]);

  // spawnAsync //

  assertEqual(await spawnAsync("/bin/sh", ["-c", "exit 0"]), null);

  try {
    await spawnAsync("/bin/sh", ["-c", "exit 123"]);
    assertFail();
  } catch ({ message }) {
    assertEqual(message, "command failure (123)");
  }

  // ["-c", "kill -KILL $$"]
  try {
    await spawnAsync("/bin/sh", ["-c", "sleep 2"], { timeout: 1 });
    assertFail();
  } catch ({ message }) {
    assertEqual(message, "command killed with SIGTERM");
  }

  // log //
  log("foo");
  logBlue("blue");
};

testAsync();
