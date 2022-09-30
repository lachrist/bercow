import {
  readdir as readdirAsync,
  readFile as readFileAsync,
} from "node:fs/promises";
import { extname as getExtension } from "node:path";
import { EOL } from "node:os";
import { load as parseYAML } from "js-yaml";
import { hasOwn } from "./util.mjs";

const {
  process: { cwd },
  JSON: { parse: parseJSON },
} = global;

const parsers = {
  ".json": parseJSON,
  ".yaml": parseYAML,
  ".yml": parseYAML,
};

const default_config_filename_array = [
  ".bercowrc.yaml",
  ".bercowrc.yml",
  ".bercowrc.json",
  ".bercowrc",
];

export const default_config = {
  clean: false,
  encoding: "utf8",
  "target-directory": ".",
  "cache-separator": EOL,
  "ordering-separator": EOL,
  "lint-cache-file": null,
  "test-cache-file": null,
  "ordering-filename": ".ordering",
  "ordering-ignore-filename": ".ordering-ignore",
  "hash-algorithm": "sha256",
  "hash-input-encoding": "utf8",
  "hash-output-encoding": "base64",
};

export const getDefaultConfig = () => default_config;

const getParser = (extension) =>
  hasOwn(parsers, extension) ? parsers[extension] : parseYAML;

const resolveConfigFilenameAsync = async (maybe_filename) => {
  if (maybe_filename === null) {
    const filenames = await readdirAsync(".");
    for (const default_filename of default_config_filename_array) {
      if (filenames.includes(default_filename)) {
        return default_filename;
      }
    }
    throw new Error(`Could not find bercow configuration file at ${cwd()}`);
  } else {
    return maybe_filename;
  }
};

export const loadConfigAsync = async (maybe_filename, encoding) => {
  const filename = await resolveConfigFilenameAsync(maybe_filename);
  return getParser(getExtension(filename))(
    await readFileAsync(filename, encoding),
  );
};
