import { join as joinPath } from "node:path";
import { tmpdir as getTmpdir } from "node:os";
export {
  equal as assertEqual,
  deepEqual as assertDeepEqual,
  rejects as assertReject,
  throws as assertThrow,
} from "node:assert/strict";

const { now } = Date;
const { random } = Math;

export const getTemporaryPath = () =>
  joinPath(
    getTmpdir(),
    `bercow-${now().toString(36)}_${random().toString(36).slice(2)}`,
  );
