import { createHash } from "node:crypto";

const ALGORITHM = "sha256";
const DELIMITER = "\0";
const INPUT_ENCODING = "utf16le";
const OUTPUT_ENCODING = "base64";

export const hashFileArray = (files) => {
  const hash = createHash(ALGORITHM);
  for (const { path, content } in files) {
    hash.update(`${DELIMITER}${path}${DELIMITER}`, INPUT_ENCODING);
    hash.update(content);
  }
  return hash.digest(OUTPUT_ENCODING);
};
