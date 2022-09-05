import { relative as toRelativePath } from "node:path";
import { Buffer } from "node:buffer";
import { default as Prettier } from "prettier";
import { ESLint } from "eslint";
import { testTurtle as testTurtleAsync, spawnAsync } from "./lib/index.mjs";

const { from: toBuffer } = Buffer;

const { format: formatPrettier, resolveConfig: resolveConfigPrettier } =
  Prettier;

const eslint = new ESLint();
let formatter = null;

testTurtleAsync({
  link: async (path) => {
    const segments = path.split(".");
    segments.splice(-1, 0, "test");
    return [path, segments.join(".")];
  },
  lint: async ({ path, content }) => {
    let source = content.toString("utf8");
    source = formatPrettier(source, {
      ...(await resolveConfigPrettier(path)),
      filepath: path,
    });
    const results = await eslint.lintText(source, { filePath: path });
    if (formatter === null) {
      formatter = await await eslint.loadFormatter("stylish");
    }
    const message = await formatter.format(results);
    if (message !== "") {
      console.log(message);
    }
    if (results[0].errorCount > 0) {
      throw new Error("eslint failure");
    } else {
      return toBuffer(source, "utf8");
    }
  },
  test: async ([{ path: main }, { path: test }]) =>
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
