import { dirname as getDirectory } from "node:path";
import {
  readFileSync as readFile,
  openSync as open,
  closeSync as close,
  unlinkSync as unlink,
  mkdirSync as mkdir,
  writeSync as write,
} from "node:fs";
import { assert, isNotEmptyString } from "./util.mjs";
import { Buffer } from "node:buffer";

const { from: toBuffer } = Buffer;

export const makeCache = (path, encoding, separator) => {
  mkdir(getDirectory(path), { recursive: true });
  return {
    path,
    encoding,
    separator,
    fd: null,
  };
};

export const readCache = (cache) => {
  let content = "";
  try {
    content = readFile(cache.path).toString(cache.encoding);
  } catch (error) {
    if (!hasOwnProperty(error, "code") || error.code !== "ENOENT") {
      throw error;
    }
  }
  return content.split(cache.separator).filter(isNotEmptyString);
};

export const resetCache = (cache) => {
  assert(cache.fd === null, "cache not closed");
  try {
    unlink(cache.path);
  } catch (error) {
    if (!hasOwnProperty(error, "code") || error.code !== "ENOENT") {
      throw error;
    }
  }
};

export const openCache = (cache) => {
  assert(cache.fd === null, "cache not closed");
  cache.fd = open(cache.path, "a");
};

export const closeCache = (cache) => {
  assert(cache.fd !== null, "cache not opened");
  close(cache.fd);
  cache.fd = null;
};

export const updateCache = (cache, entry) => {
  assert(cache.fd !== null, "cache not opened");
  write(cache.fd, toBuffer(`${entry}${cache.separator}`, cache.encoding));
};
