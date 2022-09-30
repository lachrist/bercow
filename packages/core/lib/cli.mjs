import { readFileSync as readFile } from "node:fs";
import { default as minimist } from "minimist";
import { EOL } from "node:os";
import { hasOwn, uncurry } from "./util.mjs";
import { loadPluginAsync, combinePluginArray } from "./plugin.mjs";
import { loadConfigAsync } from "./config.mjs";
import { bercowAsync } from "./api.mjs";

const {
  URL,
  JSON: { parse: parseJSON },
  Object: { entries: toEntries },
} = global;

export const runBercowAsync = async (argv) => {
  const { _: positional_argv, ...named_argv } = minimist(argv);
  if (hasOwn(named_argv, "version")) {
    const { version } = parseJSON(
      readFile(new URL("../package.json", import.meta.url), "utf8"),
    );
    process.stdout.write(`@bercow/core v${version}${EOL}`);
  }
  if (hasOwn(named_argv, "help")) {
    process.stdout.write(
      `usage: npx bercow [config-filename] [config-encoding] [...config-field]${EOL}`,
    );
  }
  const [maybe_filename = null, encoding = "utf8"] = positional_argv;
  const { plugins: definitions, ...config } = {
    plugins: [],
    ...(await loadConfigAsync(maybe_filename, encoding)),
    ...named_argv,
  };
  await bercowAsync(
    combinePluginArray(
      await Promise.all(toEntries(definitions).map(uncurry(loadPluginAsync))),
    ),
    config,
  );
};
