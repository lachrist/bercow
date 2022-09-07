import { extname as getExtension } from "node:path";
import { load as parseYAML } from "js-yaml";
import {readFileSync as readFile} from "node:fs";

const { parse: parseJSON } = JSON;

const parsers = {
  ".json": parseJSON,
  ".yaml": parseYAML,
  ".yml": parseYAML,
  ".": parseYAML,
  "": parseYAML,
};

export const readConfig = (path, encoding) =>
  parsers[getExtension(path)](readFile(path).toString(encoding));
