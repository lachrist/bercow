import { default as minimist } from "minimist";
import { fileURLToPath } from "node:url";
import {
  dirname as getDirectory,
  resolve as toAbsolutePath,
  relative as toRelativePath,
} from "node:path";
import { testTurtle as testTurtleAsync } from "../lib/index.mjs";
const { isArray } = Array;

const dirname = getDirectory(fileURLToPath(import.meta.url));

let options = {
  plugin: null,
  ...minimist(process.argv.slice(2)),
};

if (options.plugin === null) {
  console.log("usage: npx test-turtle --plugin ./path/to/plugin.mjs");
  process.exitCode = 1;
} else {
  const plugins = isArray(options.plugin) ? options.plugin : [options.plugin];
  for (let plugin of plugins) {
    if (plugin[0] === ".") {
      plugin = toRelativePath(dirname, toAbsolutePath(process.cwd(), plugin));
    }
    options = {
      ...options,
      ...(await import(plugin)),
    };
  }
  await testTurtleAsync(options);
}
