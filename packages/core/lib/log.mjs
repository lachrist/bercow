import { writeSync as write } from "node:fs";
import { EOL } from "node:os";

import { Buffer } from "node:buffer";
import { default as Chalk } from "chalk";

const { from: toBuffer } = Buffer;

const { blue: chalkBlue, gray: chalkGray } = Chalk;

const log = (message) => {
  write(1, toBuffer(message, "utf8"));
};

export const logTitle = (title) => {
  log(chalkBlue(`${title} ...${EOL}`));
};

export const logSubtitle = (subtitle) => {
  log(chalkBlue(`  > ${subtitle} ...${EOL}`));
};

export const logParagraph = (paragraph) => {
  log(chalkGray(paragraph));
};
