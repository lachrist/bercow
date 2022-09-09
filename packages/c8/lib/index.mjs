/* eslint-env node */
import { relative as relativizePath } from "node:path";
import { relative as toRelativePath } from "node:path";
import { spawnAsync } from "../../spawn/lib/spawn.mjs";

const options = {};

export default async (config, _home) => {
  config = {
    "c8-argv": ["--100"],
    ...config,
  };
  return {
    test: async (
      [{ path: main }, { path: test }],
      { cwd, logSubtitle, logParagraph },
    ) => {
      logSubtitle(`testing with c8 ${relativizePath(cwd, main)}`);
      await spawnAsync(
        logParagraph,
        "npx",
        [
          "c8",
          ...config["c8-argv"],
          "--include",
          toRelativePath(process.cwd(), main),
          "--",
          "node",
          test,
        ],
        options,
      );
    },
  };
};
