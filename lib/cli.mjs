import { dirname as getDirectory, resolve as resolvePath } from "node:path";
import { bercowAsync } from "./api.mjs";
import { log } from "./log.mjs";
import { createRequire } from "node:module";
import { loadConfig } from "./config.mjs";
import { loadPluginAsync, combinePluginArray } from "./plugin.mjs";

const { ownKeys } = Reflect;

export const runBercowAsync = async (argv, cwd) => {
  if (argv.length > 2) {
    log("usage: npx bercow [config-file] [config-encoding]\n");
    return 1;
  } else {
    const [relative_path = ".bercow.yaml", encoding = "utf8"] = argv;
    const path = resolvePath(cwd, relative_path);
    const home = getDirectory(path);
    const { resolve } = createRequire(path);
    const { plugins: sources, ...options } = {
      plugins: [],
      ...loadConfig(path, encoding),
    };
    const plugins = [];
    for (const source of ownKeys(sources)) {
      plugins.push(
        await loadPluginAsync(resolve(source), sources[source], home),
      );
    }
    await bercowAsync(
      {
        ...options,
        ...combinePluginArray(plugins),
      },
      home,
    );
    return 0;
  }
};
