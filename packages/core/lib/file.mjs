import {
  readFile as readFileAsync,
  writeFile as writeFileAsync,
} from "node:fs/promises";
import { hash } from "./hash.mjs";

const {
  JSON: { stringify: stringifyJSON },
} = global;

export const loadFileAsync = async (path, config) => ({
  path,
  config,
  content: await readFileAsync(path, config.encoding),
  digest: null,
});

export const cleanupFile = ({ path, content }) => ({ path, content });

export const hashFile = (file) => {
  if (file.digest == null) {
    file.digest = hash(stringifyJSON([file.path, file.content]), file.config);
  }
  return file.digest;
};

export const saveFileAsync = async (file, content) => {
  if (file.content !== content) {
    await writeFileAsync(file.path, content, file.config.encoding);
    file.digest = null;
    file.content = content;
  }
};
