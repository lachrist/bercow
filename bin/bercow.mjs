
import { fileURLToPath } from "node:url";
import {
  dirname as getDirectory,
  resolve as resolvePath,
  relative as relativizePath,
} from "node:path";
import {load as parseYAML} from "js-yaml";
import { bercow as bercowAsync } from "../lib/index.mjs";

const { isArray } = Array;

const getParser = (path) => {
  if (path.endsWith(".json") {
    return parseJSON;
  } else {
    return parseYAML;
  }
};

const isNotNull = (any) => any !== null;

const linkNothing = (path, _ordering) => path;

const lintNothing = ({content}, _ordering) => content;

const testNothing = (_files, _ordering) => {};

const combineLink = (linkers) => async (path, progress) => {
  const iterator = linkers[Symbol.iterator]();
  const loopAsync = async (path) => {
    const {done, value:link} = iterator.next();
    if (done) {
      return [path];
    } else {
      return (await link(path, progress)).flatMap(loop);
    }
  };
  return loopAsync(path);
};

const combineLint = (linters) => async ({path, content}, progress) => {
  for (const lint of linters) {
    content = await lint({path, content}, progress);
  }
  return content;
}

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
    return combine(monads);
  }
};

if (argv.length > 2) {
  console.log("usage: npx ghaik [config-file] [config-encoding]");
  process.exitCode = 1;
} else {
  const [
    relative_config_file = ".ghaik.yml",
    encoding = "utf8",
  ] = argv;
  const config_file = resolvePath(process.cwd(), relative_config_file);
  const home = getDirectory(config_file);
  const {plugins, ...config} = getParser(path)(await readFileAsync(path, encoding));
  const linkers = [];
  const linters = [];
  const testers = [];
  for (const source of ownKeys(plugins)) {
    const {default:plugin} = await import(source[0] === "." ? resolvePath(home, source) : source);
    const {link, lint, test} = {
      link: null,
      lint: null,
      test: null,
      ... plugin(plugins[source]),
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
