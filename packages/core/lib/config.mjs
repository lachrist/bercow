import { extname as getExtension } from "node:path";
import { load as parseYAML } from "js-yaml";
import { mapMaybe, fromMaybe, readFileMaybe } from "./util.mjs";

const { parse: parseJSON } = JSON;

const parsers = {
  ".json": parseJSON,
  ".yaml": parseYAML,
  ".yml": parseYAML,
  ".": parseYAML,
  "": parseYAML,
};

const generateDecode = (encoding) => (buffer) => buffer.toString(encoding);

export const loadConfig = (path, encoding) =>
  parsers[getExtension(path)](
    fromMaybe(mapMaybe(readFileMaybe(path), generateDecode(encoding)), "{}"),
  );
