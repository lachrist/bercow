
import { fileURLToPath } from "node:url";
import {
  dirname as getDirectory,
  resolve as toAbsolutePath,
  relative as toRelativePath,
} from "node:path";
import { testTurtle as testTurtleAsync } from "../lib/index.mjs";
const { isArray } = Array;

const dirname = getDirectory(fileURLToPath(import.meta.url));

const argv = process.argv.slice(2);

const getParser = (path) => {
  if (path.endsWith(".json") {
    return parseJSON;
  } else {
    return parseYAML;
  }
};

if (argv.length > 2) {
  console.log("usage: npx ghaik [config-file] [config-encoding]");
  process.exitCode = 1;
} else {
  let [
    config_file = ".ghaik.yml",
    encoding = "utf8",
  ] = argv;
  config_file = resolvePath(process.cwd(), path);
  const config_directory = getDirectory(config_file);
  const {plugins, ...config} = getParser(path)(await readFileAsync(path, encoding));
  const linkers = [];
  const linters = [];
  const testers = [];
  for (const source of ownKeys(plugins)) {
    const {default:plugin} = await import(
      source[0] === "."
        ? resolvePath(config_directory, source)
        : source,
    );
    const {link, lint, test} = {
      link: null,
      lint: null,
      test: null,
      ... plugin(plugins[source]),
    };
    if (link !== null) {
      linkers.push(instance.link);
    }
    if (lint !== null) {
      linters.push(instance.lint);
    }
    if (test !== null) {
      testers.push(instance.test);
    }
  }
  if (linkers.length === 0) {
    throw new Error("Missing link");
  } else if (linkers.length > 1) {
  } else {
    await testTurtleAsync({
      ...config,
      link: liners[0],
      lint: linters.length === 1 ? linters[0] : async ({path, content}, ordering) => {
        for (const lint of linters) {
          content = lint({path, content}, ordering);
        }
        return content;
      },
      test: testers.length === 1 ? testers[0] : async (files, ordering) => {
        for (const test of testers) {
          await test(files, ordering);
        }
      },
    });
  }
}
