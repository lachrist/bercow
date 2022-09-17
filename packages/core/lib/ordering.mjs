import { join as joinPath } from "node:path";
import { statSync as stat, readdirSync as readdir } from "node:fs";
import { mapMaybe, readFileMaybe } from "./util.mjs";

const makeRegExp = (pattern) => new RegExp(pattern, "u");

const trim = (string) => string.trim();

const isNotEmptyLine = (string) => string !== "" && string[0] !== "#";

const generatePredicate = (regexp) => (dirent) =>
  dirent.isDirectory() || regexp.test(dirent.name);

const compare = (string1, string2) => string1.localeCompare(string2);

const getName = ({ name }) => name;

const generateExtend = (base) => (filename) => joinPath(base, filename);

const loadDirectoryOrdering = (
  directory_path,
  ordering_filename,
  predicate,
  separator,
  encoding,
) => {
  const maybe_buffer = readFileMaybe(
    joinPath(directory_path, ordering_filename),
  );
  if (maybe_buffer === null) {
    if (predicate === null) {
      throw new Error(
        `Missing ordering file at ${directory_path} and no ordering-pattern config field was not defined`,
      );
    } else {
      const filenames = readdir(directory_path, { withFileTypes: true })
        .filter(predicate)
        .map(getName);
      filenames.sort(compare);
      return filenames;
    }
  } else {
    return maybe_buffer
      .toString(encoding)
      .split(separator)
      .map(trim)
      .filter(isNotEmptyLine);
  }
};

const generateLoadOrdering = (
  ordering_filename,
  predicate,
  separator,
  encoding,
) =>
  function self(path) {
    if (stat(path).isDirectory()) {
      return loadDirectoryOrdering(
        path,
        ordering_filename,
        predicate,
        separator,
        encoding,
      )
        .map(generateExtend(path))
        .flatMap(self);
    } else {
      return [path];
    }
  };

export const loadOrdering = (
  path,
  ordering_filename,
  pattern,
  separator,
  encoding,
) =>
  generateLoadOrdering(
    ordering_filename,
    mapMaybe(mapMaybe(pattern, makeRegExp), generatePredicate),
    separator,
    encoding,
  )(path);
