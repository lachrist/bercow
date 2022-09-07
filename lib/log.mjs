import { writeSync as write } from "node:fs";
import { default as Chalk } from "chalk";
import {Buffer} from "node:buffer";

const {from:toBuffer} = Buffer;

export const log = (message) => {
  write(1, toBuffer(message, "utf8"));
};

export const logColor = (message, color) => {
  log(Chalk[color](message));
};
