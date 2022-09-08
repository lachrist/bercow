import { Buffer } from "node:buffer";
import { relative as relativizePath} from "node:path";
import { writeSync as write } from "node:fs";
import { ESLint } from "eslint";

const { from: toBuffer } = Buffer;

export default async (config, _home) => {
  config = {
    formatter: "stylish",
    ...config,
  };
  const eslint = new ESLint();
  const formatter = await eslint.loadFormatter(config.formatter);
  return {
    lint: async ({ path, content }, { log }) => {
      log(`  > linting with eslint ${process.cwd(), relativizePath(path)} ...\n`);
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
