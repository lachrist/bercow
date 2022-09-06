import { spawnAsync } from "../lib/index.mjs";

import { relative as toRelativePath } from "node:path";

const default_config = {
  "c8-argv": ["--100"],
};

export const test = async (config) => {
  config = {...default_config, ...config};
  return async ([{ path: main }, { path: test }]) =>
    await spawnAsync(
      "npx",
      "c8",
      ... config["c8-argv"],
      "--include",
      toRelativePath(process.cwd(), main),
      "--",
      "node",
      test,
    );
};
