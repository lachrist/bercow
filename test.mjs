
import { ESLint } from "eslint";
import {relative as toRelativePath} from "path";
import { default as Prettier } from "prettier";
import { mainAsync, spawnAsync } from "./lib/index.mjs";

const {
  format: formatPrettier,
  resolveConfig: resolveConfigPrettier,
} = Prettier;

const eslint = new ESLint();
let formatter = null;

mainAsync({
  resourcesAsync: async (path) => {
    const segments = path.split(".");
    segments.splice(-1, 0, "test");
    return [
      path,
      segments.join("."),
    ];
  },
  achieveAsync: async ({ path, content }) => {
    let source = content.toString("utf8");
    source = formatPrettier(source, {
      ... await resolveConfigPrettier(path),
      filepath: path,
    });
    const result = await eslint.lintText(source, { filePath: path });
    if (formatter === null) {
      formatter = await await eslint.loadFormatter("stylish");
    }
    const message = await formatter.format(result);
    if (message !== "") {
      console.log(message);
    }
    if (result.errorCount > 0) {
      throw new Error("eslint failure");
    } else {
      return Buffer.from(source, "utf8");
    }
  },
  progressAsync: async ([{path:main}, {path:test}]) =>
    await spawnAsync(
      "npx",
      "c8",
      "--100",
      "--include",
      toRelativePath(process.cwd(), main),
      "--",
      "node",
      test,
    ),
});
