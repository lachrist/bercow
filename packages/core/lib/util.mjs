import {
  readFile as readFileAsync,
  unlink as unlinkAsync,
} from "node:fs/promises";

const {
  undefined,
  Error,
  Reflect: { apply, getOwnPropertyDescriptor },
} = global;

/* c8 ignore start */
export const {
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

///////////
// maybe //
///////////

export const mapMaybe = (maybe, closure) =>
  maybe === null ? null : closure(maybe);

export const fromMaybe = (maybe, recovery) =>
  maybe === null ? recovery : maybe;

/////////////
// closure //
/////////////

export const promisify = (f) =>
  new Promise((resolve, reject) => {
    f((error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

export const uncurry = (f) => (xs) => apply(f, undefined, xs);

export const bindX_ = (f, x1) => (x2) => f(x1, x2);

export const bind_X = (f, x2) => (x1) => f(x1, x2);

export const bind_XX = (f, x2, x3) => (x1) => f(x1, x2, x3);

export const bindXX_ = (f, x1, x2) => (x3) => f(x1, x2, x3);

////////////
// String //
////////////

export const unprefixString = (string, prefix) =>
  string.startsWith(prefix) ? string.substring(prefix.length) : string;

export const concatString = (head, body) => `${head}${body}`;

export const trimString = (string) => string.trim();

export const compareString = (string1, string2) =>
  string1.localeCompare(string2);

export const doesNotMatchRegExp = (string, regexp) => !regexp.test(string);

export const doesNotMatchAnyRegExp = (string, regexps) =>
  regexps.every(bindX_(doesNotMatchRegExp, string));

///////////////
// predicate //
///////////////

export const isNotEmptyString = (any) => any !== "";

export const isNotNull = (any) => any !== null;

export const isDuplicate = (element1, index1, array) => {
  const { length } = array;
  for (let index2 = index1 + 1; index2 < length; index2 += 1) {
    if (array[index2] === element1) {
      return true;
    }
  }
  return false;
};

////////
// fs //
////////

export const readFileMissingAsync = async (path, encoding, placeholder) => {
  try {
    return await readFileAsync(path, encoding);
  } catch (error) {
    /* c8 ignore start */
    if (hasOwn(error, "code") && error.code === "ENOENT") {
      return placeholder;
    } else {
      throw error;
    }
    /* c8 ignore stop */
  }
};

export const unlinkMissingAsync = async (path) => {
  try {
    await unlinkAsync(path);
  } catch (error) {
    /* c8 ignore start */
    if (!hasOwn(error, "code") || error.code !== "ENOENT") {
      throw error;
    }
    /* c8 ignore stop */
  }
};
