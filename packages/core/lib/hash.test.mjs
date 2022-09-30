import { assertEqual } from "../../../test/fixture.mjs";
import { hash } from "./hash.mjs";

assertEqual(
  typeof hash("content", {
    "hash-algorithm": "sha256",
    "hash-input-encoding": "utf8",
    "hash-output-encoding": "base64",
  }),
  "string",
);
