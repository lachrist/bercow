import { spawnAsync } from "../lib/index.mjs";

import { relative as toRelativePath } from "node:path";

export const test = async ([{ path: main }, { path: test }]) =>
  await spawnAsync(
    "npx",
    "c8",
    "--100",
    "--include",
    toRelativePath(process.cwd(), main),
    "--",
    "node",
    test,
  );
