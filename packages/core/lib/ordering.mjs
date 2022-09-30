import { stat as statAsync } from "node:fs/promises";
import Glob from "glob";
import Minimatch from "minimatch";
import {
  promisify,
  bindX_,
  bind_X,
  bind_XX,
  unprefixString,
  concatString,
  compareString,
  trimString,
  doesNotMatchAnyRegExp,
  readFileMissingAsync,
  isDuplicate,
} from "./util.mjs";

const { makeRe } = Minimatch;
const { glob } = Glob;

const removeDot = bind_X(unprefixString, "./");

const isNotEmptyLine = (string) => string !== "" && string[0] !== "#";

const parseList = (content, config) =>
  content
    .split(config["ordering-separator"])
    .map(trimString)
    .filter(isNotEmptyLine);

const loadOrderingFileAsync = async (directory, config) =>
  parseList(
    await readFileMissingAsync(
      `${directory}${config["ordering-filename"]}`,
      config.encoding,
      "*",
    ),
    config,
  );

const loadOrderingIgnoreFileAsync = async (directory, config) =>
  parseList(
    await readFileMissingAsync(
      `${directory}${config["ordering-ignore-filename"]}`,
      config.encoding,
      "",
    ),
    config,
  );

const loadResourceAsync = async (path, ignore, config) => {
  if ((await statAsync(path)).isDirectory()) {
    return await loadDirectoryAsync(`${path}/`, ignore, config);
  } else {
    return [path];
  }
};

const loadPatternAsync = async (pattern, ignore, config) => {
  const paths = (await promisify(bindX_(glob, pattern)))
    .map(removeDot)
    .filter(bind_X(doesNotMatchAnyRegExp, ignore));
  paths.sort(compareString);
  return (
    await Promise.all(paths.map(bind_XX(loadResourceAsync, ignore, config)))
  ).flat();
};

const compileGlob = bind_X(makeRe, { nonegate: true });

const loadDirectoryAsync = async (directory, ignore, config) => {
  const resolve = bindX_(concatString, directory);
  return (
    await Promise.all(
      (await loadOrderingFileAsync(directory, config))
        .map(resolve)
        .map(
          bind_XX(
            loadPatternAsync,
            [
              ...ignore,
              ...(await loadOrderingIgnoreFileAsync(directory, config))
                .map(resolve)
                .map(compileGlob),
            ],
            config,
          ),
        ),
    )
  ).flat();
};

export const loadOrderingAsync = async (config) => {
  const paths = await loadDirectoryAsync(
    /* c8 ignore start */
    config["target-directory"] === "." ? "" : `${config["target-directory"]}/`,
    /* c8 ignore stop */
    [],
    config,
  );
  const duplicate = paths.find(isDuplicate);
  if (duplicate === undefined) {
    return paths;
  } else {
    throw new Error(`Duplicate ordering occurence of ${duplicate}`);
  }
};
