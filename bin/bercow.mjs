import { dirname as getDirectory, resolve as resolvePath } from "node:path";
import { readFileSync as readFile, writeSync as write } from "node:fs";
import { Buffer } from "node:buffer";
import { load as parseYAML } from "js-yaml";
import { bercow as bercowAsync } from "../lib/index.mjs";

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

const argv = process.argv.slice(2);

if (argv.length > 2) {
  write(
    1,
    toBuffer("usage: npx bercow [config-file] [config-encoding]", "utf8"),
  );
  process.exitCode = 1;
} else {
  const [config_relative_path = ".bercow.yml", encoding = "utf8"] = argv;
  const config_path = resolvePath(process.cwd(), config_relative_path);
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
      link: compile(linkers, linkNothing, combineLink),
      lint: compile(linters, lintNothing, combineLint),
      test: compile(testers, testNothing, combineTest),
    },
    home,
  );
}
