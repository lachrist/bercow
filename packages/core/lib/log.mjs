import { writeSync as write } from "node:fs";

import { Buffer } from "node:buffer";
import { default as Chalk } from "chalk";

const { from: toBuffer } = Buffer;

const { blue: chalkBlue, gray: chalkGray } = Chalk;

const log = (message) => {
  write(1, toBuffer(message, "utf8"));
};

export const logTitle = (title) => {
  log(chalkBlue(`${title} ...\n`));
};

export const logSubtitle = (subtitle) => {
  log(chalkBlue(`  > ${subtitle} ...\n`));
};

export const logParagraph = (paragraph) => {
  log(chalkGray(paragraph));
};
