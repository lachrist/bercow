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

const linkNothing = (path, _ordering) => path;

const lintNothing = ({ content }, _ordering) => content;

const testNothing = (_files, _ordering) => {};

const combineLink = (linkers) => async (path, progress) => {
  const paths = [];
  for (const link of linkers) {
    paths.push(...(await link(path, progress)));
  }
  return paths;
};

const combineLint =
  (linters) =>
  async ({ path, content }, progress) => {
    for (const lint of linters) {
      content = await lint({ path, content }, progress);
    }
    return content;
  };

const combineTest = (testers) => async (files, progress) => {
  for (const test of testers) {
    await test(files, progress);
  }
};

const compile = (maybe_closure_array, nothing, combine) => {
  const closures = maybe_closure_array.filter(isNotNull);
  if (closures.length === 0) {
    return nothing;
  } else if (closures.length === 1) {
    return closures[0];
  } else {
    return combine(closures);
  }
};

const argv = process.argv.slice(2);

if (argv.length > 2) {
  write(
    1,
    toBuffer("usage: npx ghaik [config-file] [config-encoding]", "utf8"),
  );
  process.exitCode = 1;
} else {
  const [config_relative_path = ".ghaik.yml", encoding = "utf8"] = argv;
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
    const instance = {
      link: null,
      lint: null,
      test: null,
      ...plugin(plugins[source]),
    };
    linkers.push(instance.link);
    linters.push(instance.lint);
    testers.push(instance.test);
  }
  await bercowAsync({
    ...config,
    link: compile(linkers, linkNothing, combineLink),
    lint: compile(linters, lintNothing, combineLint),
    test: compile(testers, testNothing, combineTest),
  });
}
