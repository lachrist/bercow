import { createHash } from "crypto";
import { readFile, readdir, stat } from "fs/promises";
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
  format,
  identity,
  mapAsync,
  logBlue,
  logRed,
  logGreen,
  spawnAsync,
  getArrayMaybe,
} from "./util.mjs";

const { max } = Math;
const { isArray } = Array;
const { cwd } = process;

const statEitherAsync = wrapAsync(stat);
const formatEither = wrap(format);
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

const generateUpdateHashEitherAsync = (name) => async (state) => {
  const { hash, [name]: path } = state;
  return mapRight(await readFileEitherAsync(path, null), (buffer) => {
    hash.update(buffer);
    hash.update("\0", "utf8");
    return state;
  });
};

const updateMainEitherAsync = generateUpdateHashEitherAsync("main");
const updateTestEitherAsync = generateUpdateHashEitherAsync("test");

const visitNodeAsync = async (path, node, memo, options) => {
  if (typeof node === "string") {
    const { cwd } = options;
    const main = `${path}/${node}`;
    const relative_main = relative(cwd, main);
    logBlue(`${relative_main === "" ? main : relative_main} ...`);
    return fromEither(
      await bindRightAsync(await statEitherAsync(main), async (stat) => {
        let either;
        if (stat.isDirectory()) {
          const {
            exclude: { regexp },
            ordering,
          } = options;
          either = await readFileEitherAsync(`${main}/${ordering}`, "utf8");
          either = await bindLeftAsync(either, async (message) =>
            mapRight(await readdirEitherAsync(main), (filenames) =>
              filenames
                .filter((filename) => !regexp.test(filename))
                .map(prefixStar)
                .join("\n"),
            ),
          );
          either = bindRight(either, parseEither);
          either = await mapRightAsync(
            either,
            async (child) => await visitNodeAsync(main, child, memo, options),
          );
        } else {
          const {
            command,
            timeout,
            stdio,
            format: { regexp, template },
          } = options;
          either = formatEither(relative_main, regexp, template);
          either = mapRight(either, (relative_test) => ({
            main,
            relative_test,
            test: resolve(cwd, relative_test),
            hash: createHash("md5"),
          }));
          either = await bindRightAsync(either, updateMainEitherAsync);
          either = await bindRightAsync(either, updateTestEitherAsync);
          either = await bindRightAsync(
            either,
            async ({ relative_test, test, hash }) => {
              hash.update(`${main}\0${test}\0`, "utf8");
              const digest = hash.digest("hex");
              let either;
              if (memo === digest) {
                either = createRight(createMemoizedResult(digest));
              } else {
                either = await spawnEitherAsync(
                  "/bin/sh",
                  ["-c", command, "turtle", relative_main, relative_test],
                  { timeout, cwd, stdio },
                );
                either = mapRight(either, (unit) =>
                  createSuccessResult(digest),
                );
              }
              return either;
            },
          );
        }
        return either;
      }),
      createFailureResult,
      identity,
    );
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
  path = resolve(cwd(), path);
  return await visitNodeAsync(dirname(path), basename(path), memo, options);
};
