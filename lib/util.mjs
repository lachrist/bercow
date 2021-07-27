// import { format } from "util";
import { spawn } from "child_process";
import Chalk from "chalk";

const { stringify } = JSON;
const { stdout } = process;

export const format = (input, regexp, template) => {
  const parts = regexp.exec(input);
  if (parts === null) {
    throw new Error(`${regexp.toString()} does not match ${stringify(input)}`);
  }
  const [match] = parts;
  if (match !== input) {
    throw new Error(
      `${regexp.toString()} only matches ${stringify(match)} of ${stringify(
        input,
      )}`,
    );
  }
  return input.replace(regexp, template);
};

export const identity = (any) => any;

export const mapAsync = async (array, transformAsync) => {
  const { length } = array;
  const result = new Array(length);
  for (let index = 0; index < length; index += 1) {
    result[index] = await transformAsync(array[index], index, array);
  }
  return result;
};

export const getMap = (map, key) => {
  if (map.has(key)) {
    return map.get(key);
  }
  throw new Error(`missing key ${key}`);
};

export const getArrayMaybe = (array, index) =>
  index < array.length ? array[index] : null;

const signal = (child, signal) => {
  child.kill(signal);
};

export const spawnAsync = (command, argv, options) =>
  new Promise((resolve, reject) => {
    const { timeout, stdio, cwd } = {
      timeout: 0,
      stdio: "inherit",
      cwd: ".",
      ...options,
    };
    const child = spawn(command, argv, { stdio, cwd });
    if (timeout !== 0) {
      setTimeout(signal, timeout, child, "SIGTERM");
      setTimeout(signal, timeout + 1000, child, "SIGKILL");
    }
    child.on("error", reject);
    child.on("exit", (status, signal) => {
      if (signal === null) {
        if (status === 0) {
          resolve(null);
        } else {
          reject(new Error(`command failure (${String(status)})`));
        }
      } else {
        reject(new Error(`command killed with ${signal}`));
      }
    });
  });

const makeLogColor = (color) => (message) => {
  stdout.write(Chalk[color](message));
  stdout.write("\n");
};

export const log = (message) => {
  stdout.write(`${message}\n`);
};

export const logBlue = makeLogColor("blue");

export const logGreen = makeLogColor("green");

export const logRed = makeLogColor("red");
