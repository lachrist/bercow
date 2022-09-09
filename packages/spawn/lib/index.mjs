/* eslint-env node */
import { relative as relativizePath } from "node:path";
import { spawnAsync } from "./spawn.mjs";

/* c8 ignore start */
const {
  Reflect: { getOwnPropertyDescriptor },
  Object: {
    hasOwn = (object, key) =>
      getOwnPropertyDescriptor(object, key) !== undefined,
  },
} = global;
/* c8 ignore stop */

const generateSubstitute = (env) => (arg) => hasOwn(env, arg) ? env[arg] : arg;

export default async (config, home) => {
  config = {
    command: null,
    argv: ["$TEST"],
    options: {},
    ...config,
  };
  return {
    test: async (
      [{ path: main }, { path: test }],
      { cwd, logSubtitle, logParagraph },
    ) => {
      logSubtitle(
        `testing with ${config.command} ${relativizePath(cwd, main)}`,
      );
      await spawnAsync(
        logParagraph,
        config.command,
        config.argv.map(
          generateSubstitute({
            $TEST: test,
            $MAIN: main,
            $ABSOLUTE_TEST_PATH: test,
            $ABSOLUTE_MAIN_PATH: main,
            $RELATIVE_TEST_PATH: relativizePath(home, test),
            $RELATIVE_MAIN_PATH: relativizePath(home, main),
          }),
        ),
        {
          ...config.options,
          cwd: home,
        },
      );
    },
  };
};
