import * as Crypto from "crypto";
import * as Path from "path";
import * as FileSystem from "fs/promises";
import ListLang from "list-lang";
import { logBlue, logRed, logGreen } from "./log.mjs";

export const MEMOIZED_STATUS = 0;
export const SUCCESS_STATUS = 1;
export const FAILURE_STATUS = 2;

const visitNodeAsync = async (path, node, memo, options) => {
  if (typeof node === "string") {
    if (node.endsWith("/")) {
      return visitNodeAsync(
        `${path}${node}`,
        ListLang.parse(
          await FileSystem.readFile(`${path}${node}${options.layout}`, "utf8"),
        ),
        memo,
        options,
      );
    }
    const hash = Crypto.createHash("md5");
    const main = Path.relative(process.cwd(), `${path}${node}`);
    const test = options.getTestFile(main);
    hash.update(main);
    hash.update(test);
    hash.update(await FileSystem.readFile(main, "utf8"));
    hash.update(await FileSystem.readFile(test, "utf8"));
    const digest = hash.digest("hex");
    logBlue(`${main}...`);
    if (memo === digest) {
      logBlue("> Memoized");
      return {
        status: MEMOIZED_STATUS,
        memo: digest,
      };
    }
    if (await options.runAsync(main, test)) {
      logGreen("> Success");
      return {
        status: SUCCESS_STATUS,
        memo: digest,
      };
    }
    logRed("> Failure");
    return {
      status: FAILURE_STATUS,
      memo: null,
    };
  }
  const ordered = node[0] === "-";
  const nodes = node[1];
  const memos1 = Array.isArray(memo) && memo[0] === node[0] ? memo[1] : [];
  const memos2 = [];
  let status = MEMOIZED_STATUS;
  for (let index = 0; index < nodes.length; index += 1) {
    const result = await visitNodeAsync(
      path,
      nodes[index],
      index >= memos1.length || (ordered && status !== MEMOIZED_STATUS)
        ? null
        : memos1[index],
      options,
    );
    status = Math.max(status, result.status);
    memos2.push(result.memo);
    if (ordered && status === FAILURE_STATUS) {
      break;
    }
  }
  return {
    status,
    memo: [node[0], memos2],
  };
};

export const turtleAsync = async (path, memo, options) => {
  path = Path.resolve(path);
  return await visitNodeAsync(
    `${Path.dirname(path)}/`,
    `${Path.basename(path)}/`,
    memo,
    options,
  );
};
