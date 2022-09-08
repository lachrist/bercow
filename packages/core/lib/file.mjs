import { readFileSync as readFile, writeFileSync as writeFile } from "node:fs";
import { Buffer } from "node:buffer";
import { hashChunkArray } from "./hash.mjs";

const { from: toBuffer } = Buffer;

export const loadFile = (path, hashing, encoding) => ({
  path,
  encoding,
  hashing,
  content: readFile(path).toString(encoding),
  hash: null,
});

export const cleanupFile = ({ path, content }) => ({ path, content });

export const hashFile = (file) => {
  if (file.hash == null) {
    file.hash = hashChunkArray([file.path, file.content], file.hashing);
  }
  return file.hash;
};

export const saveFile = (file, content) => {
  if (file.content !== content) {
    writeFile(file.path, toBuffer(content, file.encoding));
    file.hash = null;
    file.content = content;
  }
};
