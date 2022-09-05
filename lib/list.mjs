import {
  readFile as readFileAsync,
  appendFile as appendFileAsync,
  mkdir as mkdirAsync,
} from "node:fs/promises";
import { dirname as getDirectory } from "node:path";
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
    /* c8 ignore start */
    if (error.code !== "ENOENT") {
      throw error;
    }
    /* c8 ignore stop */
  }
  return content.split("\n").filter(isNotEmptyString).map(decodeEntry);
};

export const saveListEntryAsync = async (path, entry, encoding) => {
  const content = `${encodeEntry(entry)}${"\n"}`;
  try {
    await appendFileAsync(path, content, encoding);
  } catch (error) {
    if (error.code === "ENOENT") {
      await mkdirAsync(getDirectory(path), { recursive: true });
      await appendFileAsync(path, content, encoding);
    }
  }
};
