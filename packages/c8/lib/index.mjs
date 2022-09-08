/* eslint-env node */
import { spawnAsync } from "./spawn.mjs";

import { relative as toRelativePath } from "node:path";

export default async (config, _home) => {
  config = {
    "c8-argv": ["--100"],
    ...config,
  };
  return {
    test: async ([{ path: main }, { path: test }]) =>
      await spawnAsync(
        "npx",
        "c8",
        ...config["c8-argv"],
        "--include",
        toRelativePath(process.cwd(), main),
        "--",
        "node",
        test,
      ),
  };
};
