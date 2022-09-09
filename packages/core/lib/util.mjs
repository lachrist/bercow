import { readFileSync as readFile } from "node:fs";

/* c8 ignore start */
const {
  Reflect: { getOwnPropertyDescriptor },
  Object: {
    hasOwn = (object, key) =>
      getOwnPropertyDescriptor(object, key) !== undefined,
  },
} = global;
/* c8 ignore stop */

export const assert = (boolean, message) => {
  if (!boolean) {
    throw new Error(message);
  }
};

export const readFileMaybe = (path) => {
  try {
    return readFile(path);
  } catch (error) {
    /* c8 ignore start */ if (
      !hasOwn(error, "code") ||
      error.code !== "ENOENT"
    ) {
      throw error;
    } /* c8 ignore stop */ else {
      return null;
    }
  }
};

export const mapMaybe = (maybe, closure) =>
  maybe === null ? null : closure(maybe);

export const fromMaybe = (maybe, recovery) =>
  maybe === null ? recovery : maybe;
