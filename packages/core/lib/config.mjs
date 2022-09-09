import { extname as getExtension, resolve as resolvePath } from "node:path";
import { readdirSync as readdir, readFileSync as readFile } from "node:fs";
import { load as parseYAML } from "js-yaml";

const {
  Object: { hasOwn },
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
  plugins: [],
  encoding: "utf8",
  "target-directory": ".",
  "cache-separator": "\n",
  "lint-cache-file": null,
  "test-cache-file": null,
  "ordering-filename": ".ordering",
  "ordering-pattern": null,
  "ordering-separator": "\n",
  "hash-algorithm": "sha256",
  "hash-input-encoding": "utf8",
  "hash-output-encoding": "base64",
  "hash-separator": "\0",
};

const path_key_array = [
  "lint-cache-file",
  "test-cache-file",
  "target-directory",
];

const getParser = (extension) =>
  hasOwn(parsers, extension) ? parsers[extension] : parseYAML;

export const getDefaultConfig = () => default_config;

export const resolveConfig = (config, home) => {
  config = { ...config };
  for (const key of path_key_array) {
    if (hasOwn(config, key) && config[key] !== null) {
      config[key] = resolvePath(home, config[key]);
    }
  }
  return config;
};

export const resolveConfigPath = (maybe_relative_path, cwd) => {
  if (maybe_relative_path === null) {
    const filenames = readdir(cwd);
    for (const filename1 of default_config_filename_array) {
      for (const filename2 of filenames) {
        if (filename1 === filename2) {
          return resolvePath(cwd, filename1);
        }
      }
    }
    throw new Error(`Could not find bercow configuration file at ${cwd}`);
  } else {
    return resolvePath(cwd, maybe_relative_path);
  }
};

export const loadConfig = (path, encoding) =>
  getParser(getExtension(path))(readFile(path).toString(encoding));
