// import { format } from "util";
import { spawn } from "child_process";
import Chalk from "chalk";

const { stdout } = process;

// const { stringify } = JSON;
// export const replace = (regexp, input, format) => {
//   const parts = regexp.exec(input);
//   if (parts === null) {
//     throw new Error(
//       `failed to match ${regexp.toString()} against ${stringify(input)}`,
//     );
//   }
//   return parts;
// };

export const identity = (any) => any;

export const mapAsync = async (array, transformAsync) => {
  const {length} = array;
  const result = new Array(length);
  for (let index = 0; index < length; index += 1) {
    result[index] = await transformAsync(array[index], index, array);
  }
  return result;
};

export const getArrayMaybe = (array, index) =>
  index < array.length ? array[index] : null;

const signal = (child, signal) => {
  child.kill(signal);
};

export const spawnAsync = (command, argv, timeout) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, argv, { stdio: "inherit" });
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

export const logBlue = makeLogColor("blue");

export const logGreen = makeLogColor("green");

export const logRed = makeLogColor("red");
