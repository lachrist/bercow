import { readFileSync, appendFileSync } from "node:fs";
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

export const loadList = (path, encoding) =>
  readFileSync(path, encoding)
    .split("\n")
    .filter(isNotEmptyString)
    .map(decodeEntry);

export const saveListEntry = (path, entry, encoding) => {
  appendFileSync(path, `${encodeEntry(entry)}${"\n"}`, encoding);
};
