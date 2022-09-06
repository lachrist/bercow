import { default as Buffer } from "node:buffer";
import { writeSync as write } from "node:fs";
import { ESLint } from "eslint";

const { from: toBuffer } = Buffer;

export default async (_config) => {
  const eslint = new ESLint();
  const formatter = await eslint.loadFormatter("stylish");
  return {
    lint: async ({ path, content }) => {
      const results = await eslint.lintText(content, { filePath: path });
      const message = await formatter.format(results);
      if (message !== "") {
        write(1, toBuffer(message, "utf8"));
      }
      if (results[0].errorCount > 0) {
        throw new Error("eslint failure");
      } else {
        return content;
      }
    },
  };
};
