import { writeSync as write } from "node:fs";

import { Buffer } from "node:buffer";
import { default as Chalk } from "chalk";

const { from: toBuffer } = Buffer;

export const log = (message) => {
  write(1, toBuffer(message, "utf8"));
};

export const logColor = (message, color) => {
  log(Chalk[color](message));
};
