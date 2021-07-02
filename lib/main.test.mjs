import * as FileSystem from "fs/promises";
import { strict as Assert } from "assert";
import { mainAsync } from "./main.mjs";

(async () => {
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
  await FileSystem.writeFile(
    `${options.target}/${options["layout-filename"]}`,
    "qux",
    "utf8",
  );
  await FileSystem.writeFile(`${options.target}/qux`, "", "utf8");
  await FileSystem.writeFile(`${options.target}/quxqux`, "", "utf8");
  try {
    await FileSystem.unlink(
      `${options.target}/${options["memoization-filename"]}`,
    );
  } catch (error) {
    Assert.equal(error.code, "ENOENT");
  }
  await mainAsync(options);
  Assert.equal(
    JSON.parse(
      await FileSystem.readFile(
        `${options.target}/${options["memoization-filename"]}`,
        "utf8",
      ),
    ),
    null,
  );
  await mainAsync(options);
  await mainAsync({ help: true });
})().then(() => {
  process.stdout.write("DONE\n");
});
