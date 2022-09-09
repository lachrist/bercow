/* eslint-env node */
import { relative as relativizePath } from "node:path";
import { platform } from "node:os";
import { spawnAsync } from "../../spawn/lib/spawn.mjs";

const options = {};

export default async (config, home) => {
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
        /* c8 ignore start */
        platform() === "win32" ? "npx.cmd" : "npx",
        /* c8 ignore stop */
        [
          "c8",
          ...config["c8-argv"],
          "--include",
          relativizePath(home, main),
          "--",
          "node",
          test,
        ],
        {
          ...options,
          cwd: home,
        },
      );
    },
  };
};
