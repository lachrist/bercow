import * as FileSystem from "fs";
import { strict as Assert } from "assert";

import {
  turtleAsync,
  MEMOIZED_STATUS,
  SUCCESS_STATUS,
  FAILURE_STATUS,
} from "./index.mjs";

const directory = "tmp";
const layout = ".yo.list";
const getTestFile = (path) => `${path}.test`;

const options = {
  layout,
  getTestFile,
  runAsync: (main, test) => Promise.resolve(true),
};

FileSystem.writeFileSync(
  `${directory}/${layout}`,
  ["- foo", "- * bar", "  * qux"].join("\n"),
  "utf8",
);

for (let filename of ["foo", "bar", "qux"]) {
  const path = `${directory}/${filename}`;
  FileSystem.writeFileSync(path, `main ${filename}`, "utf8");
  FileSystem.writeFileSync(getTestFile(path), `test ${filename}`, "utf8");
}

(async () => {
  const result1 = await turtleAsync(directory, null, {
    ...options,
    runAsync: (main, test) => Promise.resolve(false),
  });
  Assert.equal(result1.status, FAILURE_STATUS);
  Assert.deepEqual(result1.memo, ["-", [null]]);
  const result2 = await turtleAsync(directory, null, options);
  Assert.equal(result2.status, SUCCESS_STATUS);
  const result3 = await turtleAsync(directory, result2.memo, options);
  Assert.equal(result3.status, MEMOIZED_STATUS);
  Assert.deepEqual(result2.memo, result3.memo);
})()
  .then(() => {})
  .catch((error) => {
    throw error;
  });
