import { assertEqual } from "../../../test/fixture.mjs";
import { Buffer } from "node:buffer";
import { makeHashing, hashChunkArray } from "./hash.mjs";

const { from: toBuffer } = Buffer;

const hashing = makeHashing("sha256", "\0", "utf8", "utf8");

assertEqual(
  hashChunkArray(["foo", "bar"], hashing),
  hashChunkArray([toBuffer("foo", "utf8"), toBuffer("bar", "utf8")], hashing),
);
