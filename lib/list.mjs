import {
  readFile as readFileAsync,
  appendFile as appendFileAsync,
} from "node:fs/promises";
import {
  generateDiscreteFunction,
  isNotEmptyString,
  inversePair,
} from "./util.mjs";

const pairs = [
  ["\\", "\\\\"],
  ["\n", "\\n"],
];

const decodeEscapeSequence = generateDiscreteFunction(
  new Map(pairs.map(inversePair)),
);

const encodeSpecialCharacter = generateDiscreteFunction(new Map(pairs));

const decodeEntry = (entry) => entry.replace(/\\./gu, decodeEscapeSequence);

const encodeEntry = (entry) =>
  entry.replace(/[\n\\]/gu, encodeSpecialCharacter);

export const loadListAsync = async (path, encoding) => {
  let content = "";
  try {
    content = await readFileAsync(path, encoding);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
  return content.split("\n").filter(isNotEmptyString).map(decodeEntry);
};

export const saveListEntryAsync = async (path, entry, encoding) => {
  await appendFileAsync(path, `${encodeEntry(entry)}${"\n"}`, encoding);
};
