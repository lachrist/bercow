import { createHash } from "crypto";
import { readFile, readdir } from "fs/promises";
import { relative, resolve, dirname, basename } from "path";
import { parse } from "list-lang";
import {
  createRight,
  fromEither,
  mapRight,
  mapRightAsync,
  bindRight,
  bindRightAsync,
  bindLeftAsync,
  wrap,
  wrapAsync,
} from "./either.mjs";
import {
  identity,
  mapAsync,
  logBlue,
  logRed,
  logGreen,
  spawnAsync,
  getArrayMaybe,
} from "./util.mjs";

const { cwd } = process;
const { max } = Math;
const { isArray } = Array;

const readFileEitherAsync = wrapAsync(readFile);
const parseEither = wrap(parse);
const spawnEitherAsync = wrapAsync(spawnAsync);
const readdirEitherAsync = wrapAsync(readdir);
const prefixStar = (filename) => `* ${filename}`;

export const MEMOIZED_STATUS = 0;
export const SUCCESS_STATUS = 1;
export const FAILURE_STATUS = 2;

const createFailureResult = (message) => {
  logRed(`> Failure: ${message}`);
  return { status: FAILURE_STATUS, memo: null };
};

const createMemoizedResult = (digest) => {
  logBlue("> Memoized");
  return { status: MEMOIZED_STATUS, memo: digest };
};

const createSuccessResult = (digest) => {
  logGreen("> Success");
  return { status: SUCCESS_STATUS, memo: digest };
};

const generateUpdateHashAsync = (path) => async (hash) =>
  mapRight(await readFileEitherAsync(path, null), (buffer) => {
    hash.update(buffer);
    return hash;
  });

const visitNodeAsync = async (path, node, memo, options) => {
  if (typeof node === "string") {
    let either;
    const main = `${path}${node}`;
    logBlue(`${relative(cwd(), main)} ...`);
    if (node.endsWith("/")) {
      const { filter_regexp, layout } = options;
      either = await readFileEitherAsync(`${main}${layout}`, "utf8");
      either = await bindLeftAsync(either, async (message) =>
        mapRight(await readdirEitherAsync(main), (filenames) =>
          filenames
            .filter((filename) => filter_regexp.test(filename))
            .map(prefixStar)
            .join(""),
        ),
      );
      either = bindRight(either, parseEither);
      either = await mapRightAsync(
        either,
        async (child) => await visitNodeAsync(main, child, memo, options),
      );
    } else {
      const { command, timeout, transform_regexp, transform_format } = options;
      const test = main.replace(transform_regexp, transform_format);
      either = createRight(createHash("md5"));
      either = await bindRightAsync(either, generateUpdateHashAsync(main));
      either = await bindRightAsync(either, generateUpdateHashAsync(test));
      either = await bindRightAsync(either, async (hash) => {
        hash.update(`${main}${test}`, "utf8");
        const digest = hash.digest("hex");
        let either;
        if (memo === digest) {
          either = createRight(createMemoizedResult(digest));
        } else {
          either = await spawnEitherAsync("/bin/sh", [
            "-c",
            command,
            "turtle",
            main,
            test,
          ], timeout);
          either = mapRight(either, (unit) => createSuccessResult(digest));
        }
        return either;
      });
    }
    return fromEither(either, createFailureResult, identity);
  }
  const [head, children] = node;
  const memos1 = isArray(memo) ? memo : [];
  let aggregate = MEMOIZED_STATUS;
  const memos2 = await mapAsync(
    children,
    head === "*"
      ? async (node, index) => {
          const { status, memo } = await visitNodeAsync(
            path,
            node,
            getArrayMaybe(memos1, index),
            options,
          );
          aggregate = max(aggregate, status);
          return memo;
        }
      : async (node, index, array) => {
          if (aggregate === FAILURE_STATUS) {
            return null;
          }
          const { status, memo } = await visitNodeAsync(
            path,
            node,
            aggregate === MEMOIZED_STATUS ? getArrayMaybe(memos1, index) : null,
            options,
          );
          aggregate = max(aggregate, status);
          return memo;
        },
  );
  return {
    status: aggregate,
    memo: memos2,
  };
};

export const turtleAsync = async (path, memo, options) => {
  path = resolve(path);
  return await visitNodeAsync(
    `${dirname(path)}/`,
    `${basename(path)}/`,
    memo,
    options,
  );
};
