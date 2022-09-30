import { open as openAsync, mkdir as mkdirAsync } from "node:fs/promises";
import {
  assert,
  isNotEmptyString,
  readFileMissingAsync,
  unlinkMissingAsync,
} from "./util.mjs";

export const createCacheAsync = async (path, config) => {
  const segments = path.split("/");
  segments.pop();
  await mkdirAsync(segments.join("/"), { recursive: true });
  return {
    path,
    handle: null,
    config,
  };
};

export const readCacheAsync = async (cache) =>
  (await readFileMissingAsync(cache.path, cache.config.encoding, ""))
    .split(cache.config["cache-separator"])
    .filter(isNotEmptyString);

export const resetCacheAsync = async (cache) => {
  assert(cache.handle === null, "cache not closed");
  await unlinkMissingAsync(cache.path);
};

export const openCacheAsync = async (cache) => {
  assert(cache.handle === null, "cache not closed");
  cache.handle = await openAsync(cache.path, "a");
};

export const closeCacheAsync = async (cache) => {
  assert(cache.handle !== null, "cache not opened");
  await cache.handle.close();
  cache.handle = null;
};

export const appendCache = (cache, entry) => {
  assert(cache.handle !== null, "cache not opened");
  cache.handle.write(
    `${entry}${cache.config["cache-separator"]}`,
    cache.config.encoding,
  );
};
