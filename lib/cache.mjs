import { dirname as getDirectory } from "node:path";
import {
  readFileSync as readFile,
  openSync as open,
  closeSync as close,
  unlinkSync as unlink,
  mkdirSync as mkdir,
  writeSync as write,
} from "node:fs";
import { Buffer } from "node:buffer";
import { assert } from "./util.mjs";

const { hasOwn } = Object;
const { from: toBuffer } = Buffer;

const isNotEmptyString = (any) => any !== "";

export const makeCache = (path, separator, encoding) => {
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
    /* c8 ignore start */
    if (!hasOwn(error, "code") || error.code !== "ENOENT") {
      throw error;
    }
    /* c8 ignore stop */
  }
  return content.split(cache.separator).filter(isNotEmptyString);
};

export const resetCache = (cache) => {
  assert(cache.fd === null, "cache not closed");
  try {
    unlink(cache.path);
  } catch (error) {
    /* c8 ignore start */
    if (!hasOwn(error, "code") || error.code !== "ENOENT") {
      throw error;
    }
    /* c8 ignore stop */
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
