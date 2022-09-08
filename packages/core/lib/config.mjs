import { extname as getExtension } from "node:path";
import { load as parseYAML } from "js-yaml";
import { readFileSync as readFile } from "node:fs";

const { hasOwn } = Object;
const { parse: parseJSON } = JSON;

const parsers = {
  ".json": parseJSON,
  ".yaml": parseYAML,
  ".yml": parseYAML,
  ".": parseYAML,
  "": parseYAML,
};

const readFileMissing = (path, placeholder) => {
  try {
    return readFile(path);
  } catch (error) {
    /* c8 ignore start */ if (
      !hasOwn(error, "code") ||
      error.code !== "ENOENT"
    ) {
      throw error;
    } /* c8 ignore stop */ else {
      return placeholder;
    }
  }
};

export const loadConfig = (path, encoding) =>
  parsers[getExtension(path)](readFileMissing(path, "{}").toString(encoding));
