import { strict as Assert } from "assert";
import { assert, assertReject } from "./assert.mjs";

Assert.throws(() => assert(false, "%s", "BOUM"), /^Error: BOUM$/);

Assert.throws(
  () =>
    assertReject(
      (error) => {
        throw error;
      },
      false,
      "%s",
      "BOUM",
    ),
  /^Error: BOUM$/,
);
