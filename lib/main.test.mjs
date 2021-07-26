import { readFile, writeFile, unlink } from "fs/promises";
import { strict as Assert } from "assert";
import { mainAsync } from "./main.mjs";

// const { stdout } = process;
const { equal: assertEqual } = Assert;
const { parse } = JSON;

const testAsync = async () => {
  const options = {
    "replace-regexp-body": "(.*)/([^/]*)$",
    "replace-regexp-flags": "u",
    "replace-template": "$1/$2$2",
    memoization: true,
    "memoization-filename": "foo.json",
    "layout-filename": ".bar.list",
    target: "tmp",
    help: false,
    _: ["exit 1"],
  };
  const { target } = options;
  await writeFile(`${target}/${options["layout-filename"]}`, "qux", "utf8");
  await writeFile(`${target}/qux`, "", "utf8");
  await writeFile(`${target}/quxqux`, "", "utf8");
  try {
    await unlink(`${target}/${options["memoization-filename"]}`);
  } catch ({ code }) {
    assertEqual(code, "ENOENT");
  }
  await mainAsync(options);
  assertEqual(
    parse(
      await readFile(`${target}/${options["memoization-filename"]}`, "utf8"),
    ),
    null,
  );
  await mainAsync(options);
  await mainAsync({ help: true });
};

testAsync();
