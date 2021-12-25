import { readFile, writeFile, mkdir } from "fs/promises";
import { tmpdir } from "os";
import { strict as Assert } from "assert";
import { mainAsync } from "./main.mjs";

// const { stdout } = process;
const { random } = Math;
const { equal: assertEqual } = Assert;
const { parse } = JSON;

const testAsync = async () => {
  const directory = `${tmpdir()}/${random().toString(36).substring(2)}`;
  const options = {
    "format-regexp": "^(.*)$",
    "format-regexp-flags": "u",
    "format-template": "$1$1",
    memoization: true,
    "memoization-path": `${directory}/foo.json`,
    "ordering-filename": ".bar.list",
    target: directory,
    help: false,
    _: ["/bin/sh", "-c", "exit 0"],
  };
  await mkdir(directory);
  await writeFile(`${directory}/.bar.list`, "qux", "utf8");
  await writeFile(`${directory}/qux`, "", "utf8");
  await writeFile(`${directory}/quxqux`, "", "utf8");
  assertEqual(await mainAsync({ ...options, layout: "foobar" }), 1);
  assertEqual(
    await mainAsync({ ...options, _: ["/bin/sh", "-c", "exit 1"] }),
    1,
  );
  assertEqual(parse(await readFile(`${directory}/foo.json`, "utf8")), null);
  assertEqual(await mainAsync(options), 0);
  assertEqual(
    typeof parse(await readFile(`${directory}/foo.json`, "utf8")),
    "string",
  );
  assertEqual(await mainAsync(options), 0);
  assertEqual(await mainAsync({ ...options, _: [] }), 1);
  assertEqual(await mainAsync({ ...options, help: true, _: [] }), 0);
  assertEqual(await mainAsync({ ...options, help: true }), 0);
};

testAsync();
