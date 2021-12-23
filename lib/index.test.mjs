import { writeFile, mkdir } from "fs/promises";
import { tmpdir } from "os";
import { strict as Assert } from "assert";

Error.stackTraceLimit = Infinity;

const { random } = Math;
const { equal: assertEqual, deepEqual: assertDeepEqual } = Assert;

import {
  turtleAsync,
  MEMOIZED_STATUS,
  SUCCESS_STATUS,
  FAILURE_STATUS,
} from "./index.mjs";

const testAsync = async () => {
  const directory = `${tmpdir()}/${random().toString(36).substring(2)}`;

  const options = {
    exclude: { regexp: /\.test$/u },
    format: { regexp: /^.*$/u, template: "$&.test" },
    ordering: "list",
    command: "/bin/sh",
    argv: ["-c", "exit 0"],
    main_variable: "TURTLE_MAIN",
    test_variable: "TURTLE_TEST",
    between: [],
    after: [],
    stdio: "inherit",
    timeout: 0,
    cwd: directory,
  };

  await mkdir(directory);
  await mkdir(`${directory}/bar`);
  await writeFile(`${directory}/bar/buz.test`, "noise buz", "utf8");

  await writeFile(
    `${directory}/list`,
    ["- foo", "- * bar/", "  * qux"].join("\n"),
    "utf8",
  );

  for (let filename of ["foo", "bar/bar", "qux"]) {
    const path = `${directory}/${filename}`;
    await writeFile(path, `main ${filename}`, "utf8");
    await writeFile(`${path}.test`, `test ${filename}`, "utf8");
  }

  assertDeepEqual(
    await turtleAsync(directory, null, { ...options, argv: ["-c", "exit 1"] }),
    { status: FAILURE_STATUS, memo: [null, null] },
  );

  const { status: status1, memo: memo1 } = await turtleAsync(
    directory,
    null,
    options,
  );
  assertEqual(status1, SUCCESS_STATUS);

  const { status: status2, memo: memo2 } = await turtleAsync(
    directory,
    memo1,
    options,
  );
  assertEqual(status2, MEMOIZED_STATUS);
  assertDeepEqual(memo1, memo2);
};

testAsync();
