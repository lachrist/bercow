
import {readFile, writeFile} from "node:fs";
import { ESLint } from "eslint";
import { format } from "prettier";
import {main, spawnSync} from "reborn/main.mjs";

const eslint = new ESLint();

const mapTestFile = (path) => {
  const segments = path.split(".");
  segments.splice(segments.length - 1, "test");
  return segments.join(".");
};

const formatAsync = (path) => {
  const content = await readFile(path, "utf8");
  const formatted_content = formatPrettier(content);
  if (formatted_content !== content) {
    await writeFile(path, formatted_content, "utf8");
  }
};

main({
  resources: (path) => [mapTestFile(path)],
  acheiveAsync: await (path) => {
    await formatAsync(path);
    await formatAsync(mapTestFile(path));
    await eslint.lintFiles([path, mapTestFile(path)]);
  },
  progressAsync: (path) => {
    spawnSync("node", getTestFile(path));
  };
});
