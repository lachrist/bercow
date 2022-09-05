import { Buffer } from "node:buffer";
import { ESLint } from "eslint";
import { default as Prettier } from "prettier";

const { from: toBuffer } = Buffer;
const { format: formatPrettier, resolveConfig: resolveConfigPrettier } =
  Prettier;

const eslint = new ESLint();
let formatter = null;

export const lint = async ({ path, content }) => {
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
};
