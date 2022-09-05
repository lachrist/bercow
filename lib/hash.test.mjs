import { equal as assertEqual, notEqual as assertNotEqual } from "node:assert";
import { Buffer } from "node:buffer";
import { hashFileArray } from "./hash.mjs";

const { from: toBuffer } = Buffer;

const file1 = { path: "/path.txt", content: toBuffer("content", "utf8") };

const file2 = { path: "/PATH.txt", content: toBuffer("content", "utf8") };

const file3 = { path: "/PATH.txt", content: toBuffer("CONTENT", "utf8") };

assertEqual(hashFileArray([file1]), hashFileArray([file1]));

assertNotEqual(hashFileArray([file1]), hashFileArray([file2]));

assertNotEqual(hashFileArray([file1]), hashFileArray([file3]));
