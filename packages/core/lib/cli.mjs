import { dirname as getDirectory, resolve as resolvePath } from "node:path";
import { createRequire } from "node:module";
import { default as minimist } from "minimist";
import { loadPluginAsync, combinePluginArray } from "./plugin.mjs";
import { bercowAsync } from "./api.mjs";
import { loadConfig } from "./config.mjs";

const { hasOwn } = Object;
const { ownKeys } = Reflect;

export const runBercowAsync = async (argv, cwd) => {
  const { _: positional_argv, ...named_argv } = minimist(argv);
  if (hasOwn(named_argv, "version")) {
    // TODO load actual version -- eg: import {version} from "../package.json";
    process.stdout.write("@bercow/core v0.0.0\n");
  }
  if (hasOwn(named_argv, "help")) {
    process.stdout.write(
      "usage: npx bercow [config-file] [config-encoding] [...config-field]\n",
    );
  }
  const [relative_path = ".bercow.yaml", encoding = "utf8"] = positional_argv;
  const path = resolvePath(cwd, relative_path);
  const home = getDirectory(path);
  const { resolve } = createRequire(path);
  const { plugins: sources, ...options } = {
    plugins: [],
    ...loadConfig(path, encoding),
    ...named_argv,
  };

  const plugins = [];
  for (const source of ownKeys(sources)) {
    plugins.push(await loadPluginAsync(resolve(source), sources[source], home));
  }
  await bercowAsync(
    {
      ...options,
      ...combinePluginArray(plugins),
    },

    home,
  );
};
