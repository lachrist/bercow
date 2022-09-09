/* eslint-env node */
import { relative as relativizePath } from "node:path";
import { spawnAsync } from "./spawn.mjs";

const { hasOwn } = Object;

const generateSubstitute = (env) => (arg) => hasOwn(env, arg) ? env[arg] : arg;

export default async (config, home) => {
  config = {
    command: null,
    argv: ["$TEST"],
    options: {},
    ...config,
  };
  config.options = {
    cwd: home,
    ...config.options,
  };
  return {
    test: async (
      [{ path: main }, { path: test }],
      { logSubtitle, logParagraph },
    ) => {
      logSubtitle(
        `testing with ${config.command} ${relativizePath(home, main)}`,
      );
      await spawnAsync(
        logParagraph,
        config.command,
        config.argv.map(
          generateSubstitute({
            $TEST: test,
            $MAIN: main,
            "$ABSOLUTE-TEST-PATH": test,
            "$ABSOLUTE-MAIN-PATH": main,
            "$RELATIVE-TEST-PATH": relativizePath(home, test),
            "$RELATIVE-MAIN-PATH": relativizePath(home, main),
          }),
        ),
        config.command,
      );
    },
  };
};
