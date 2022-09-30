import { createHash } from "node:crypto";

export const hash = (content, config) => {
  const hashing = createHash(config["hash-algorithm"]);
  hashing.update(content, config["hash-input-algorithm"]);
  return hashing.digest(config["hash-output-encoding"]);
};
