import { dirname as getDirectory, join as joinPath } from "node:path";
import { readFileSync as readFile } from "node:fs";
import { createRequire } from "node:module";
import { default as minimist } from "minimist";
import { fileURLToPath } from "node:url";
import { loadPluginAsync, combinePluginArray } from "./plugin.mjs";
import {
  getDefaultConfig,
  loadConfig,
  resolveConfig,
  resolveConfigPath,
} from "./config.mjs";
import { bercowAsync } from "./api.mjs";

const {
  JSON: { parse: parseJSON },
  Object: { hasOwn },
  Reflect: { ownKeys },
} = global;

export const runBercowAsync = async (argv, cwd) => {
  const { _: positional_argv, ...named_argv } = minimist(argv);
  if (hasOwn(named_argv, "version")) {
    const __dirname = getDirectory(fileURLToPath(import.meta.url));
    const { version } = parseJSON(
      readFile(joinPath(__dirname, "..", "package.json"), "utf8"),
    );

    process.stdout.write(`@bercow/core v${version}\n`);
  }
  if (hasOwn(named_argv, "help")) {
    process.stdout.write(
      "usage: npx bercow [config-file] [config-encoding] [...config-field]\n",
    );
  }
  const [maybe_relative_path = null, encoding = "utf8"] = positional_argv;
  const path = resolveConfigPath(maybe_relative_path, cwd);
  const home = getDirectory(path);
  const config = {
    ...resolveConfig(getDefaultConfig(), cwd),
    ...resolveConfig(loadConfig(path, encoding), home),
    ...resolveConfig(named_argv, cwd),
  };

  const { resolve } = createRequire(path);
  const plugins = [];
  for (const source of ownKeys(config.plugins)) {
    plugins.push(
      await loadPluginAsync(resolve(source), config.plugins[source], home),
    );
  }
  await bercowAsync(combinePluginArray(plugins), config, cwd);
};
