import { readFile as readFileAsync, writeFile as writeFileAsync } from "node:fs/promises";
import { ESLint } from "eslint";
import { format as formatPrettier } from "prettier";
import { mainAsync, spawnAsync } from "./lib/index.mjs";

const eslint = new ESLint();

const mapTestFile = (path) => {
  const segments = path.split(".");
  segments.splice(segments.length - 1, "test");
  return segments.join(".");
};

const formatAsync = async (path) => {
  const content = await readFileAsync(path, "utf8");
  const formatted_content = formatPrettier(content);
  if (formatted_content !== content) {
    await writeFileAsync(path, formatted_content, "utf8");
  }
};

const lintAsync = (paths) => eslint.lintFiles(paths);

mainAsync({
  resources: (path) => [mapTestFile(path)],
  acheiveAsync: async (path) => {
    await formatAsync(path);
    await formatAsync(mapTestFile(path));
    await lintAsync([path, mapTestFile(path)]);
  },
  progressAsync: (path) =>
    spawnAsync("npx", "c8", "--include", path, "--", "node", mapTestFile(path)),
});
