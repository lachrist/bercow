import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";

const { from: toBuffer } = Buffer;

const convertChunk = (chunk, encoding) =>
  typeof chunk === "string" ? toBuffer(chunk, encoding) : chunk;

export const makeHashing = (
  algorithm,
  separator,
  input_encoding,
  output_encoding,
) => ({
  algorithm,
  separator: convertChunk(separator, input_encoding),
  input_encoding,
  output_encoding,
});

export const hashChunkArray = (chunks, options) => {
  const hashing = createHash(options.algorithm);
  for (const chunk of chunks) {
    hashing.update(convertChunk(chunk, options.input_encoding));
    hashing.update(options.separator);
  }
  return hashing.digest().toString(options.output_encoding);
};
