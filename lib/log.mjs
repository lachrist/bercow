import Chalk from "chalk";

const makeLogColor = (color) => (message) => {
  process.stdout.write(Chalk[color](message));
  process.stdout.write("\n");
};

export const logBlue = makeLogColor("blue");

export const logGreen = makeLogColor("green");

export const logRed = makeLogColor("red");
