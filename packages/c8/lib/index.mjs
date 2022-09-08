/* eslint-env node */ import { relative as relativizePath } from "node:path";
import { relative as toRelativePath } from "node:path";
import { spawnAsync } from "./spawn.mjs";

export default async (config, _home) => {
  config = {
    "c8-argv": ["--100"],
    ...config,
  };
  return {
    test: async (
      [{ path: main }, { path: test }],
      { logSubtitle, logParagraph },
    ) => {
      logSubtitle(`testing with c8 ${relativizePath(process.cwd(), main)}`);
      await spawnAsync(
        logParagraph,
        "npx",
        "c8",
        ...config["c8-argv"],
        "--include",
        toRelativePath(process.cwd(), main),
        "--",
        "node",
        test,
      );
    },
  };
};
