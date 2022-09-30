import { strict as AssertStrict } from "node:assert";
import { mkdir as mkdirAsync } from "node:fs/promises";

export const {
  equal: assertEqual,
  deepEqual: assertDeepEqual,
  rejects: assertRejectAsync,
  throws: assertThrow,
} = AssertStrict;

const {
  Date: { now },
  Math: { random },
} = global;

export const makeTempDirAsync = async () => {
  const path = `tmp/test-${now().toString(36)}_${random()
    .toString(36)
    .slice(2)}`;
  await mkdirAsync(path, { recursive: true });
  return path;
};

// process: { cwd: getCwd },
// import { join as joinPath, relative as relativizePath } from "node:path";
// import { tmpdir as getTmpdir, platform as getPlatform } from "node:os";
// export const getTemporaryPath = () => {
//   const paftform_specific_path = relativizePath(
//     cwd(),
//     joinPath(
//       getTmpdir(),
//       `bercow-${now().toString(36)}_${random().toString(36).slice(2)}`,
//     ),
//   );
//   return getPlatform() === "win32"
//     ? paftform_specific_path.replace(/\\/gu, "/")
//     : paftform_specific_path;
// };
