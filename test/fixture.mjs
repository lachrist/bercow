import { join as joinPath } from "node:path";
import { tmpdir as getTmpdir } from "node:os";
import { strict as AssertStrict } from "node:assert";

export const {
  equal: assertEqual,
  deepEqual: assertDeepEqual,
  rejects: assertReject,
  throws: assertThrow,
} = AssertStrict;

const { now } = Date;
const { random } = Math;

export const getTemporaryPath = () =>
  joinPath(
    getTmpdir(),
    `bercow-${now().toString(36)}_${random().toString(36).slice(2)}`,
  );
