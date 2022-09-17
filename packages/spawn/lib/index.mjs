/* eslint-env node */
import { relative as relativizePath } from "node:path";
import { platform } from "node:os";
import { spawnAsync } from "./spawn.mjs";

const {
  Reflect: { getOwnPropertyDescriptor },
  Object: {
    /* c8 ignore start */
    hasOwn = (object, key) =>
      getOwnPropertyDescriptor(object, key) !== undefined,
    /* c8 ignore stop */
  },
} = global;

const generateSubstitute = (env) => (arg) => hasOwn(env, arg) ? env[arg] : arg;

export default async (config, home) => {
  config = {
    command: null,
    argv: ["$TEST"],
    options: {},
    ...config,
  };
  const key = `command-${platform()}`;
  if (hasOwn(config, key) && config[key] !== null) {
    config.command = config[key];
  }
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
