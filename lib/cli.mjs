import { dirname as getDirectory, resolve as resolvePath } from "node:path";
import { readFileSync as readFile, writeSync as write } from "node:fs";
import { Buffer } from "node:buffer";
import { load as parseYAML } from "js-yaml";
import { bercowAsync } from "./api.mjs";

const { from: toBuffer } = Buffer;
const { parse: parseJSON } = JSON;
const { ownKeys } = Reflect;

const getParser = (path) => {
  if (path.endsWith(".json")) {
    return parseJSON;
  } else {
    return parseYAML;
  }
};

const isNotNull = (any) => any !== null;

export const runBercowAsync = async (argv, cwd) => {
  if (argv.length > 2) {
    write(
      1,
      toBuffer("usage: npx bercow [config-file] [config-encoding]\n", "utf8"),
    );
    return 1;
  } else {
    const [config_relative_path = ".bercow.yaml", encoding = "utf8"] = argv;
    const config_path = resolvePath(cwd, config_relative_path);
    const home = getDirectory(config_path);
    const { plugins, ...config } = {
      plugins: null,
      ...getParser(config_path)(readFile(config_path, encoding)),
    };
    const linkers = [];
    const linters = [];
    const testers = [];
    for (const source of ownKeys(plugins)) {
      const { default: plugin } = await import(
        source[0] === "." ? resolvePath(home, source) : source
      );
      const { link, lint, test } = {
        link: null,
        lint: null,
        test: null,
        ...(await plugin(plugins[source], home)),
      };
      linkers.push(link);
      linters.push(lint);
      testers.push(test);
    }
    await bercowAsync(
      {
        ...config,
        link: linkers.filter(isNotNull),
        lint: linters.filter(isNotNull),
        test: testers.filter(isNotNull),
      },
      home,
    );
    return 0;
  }
};
