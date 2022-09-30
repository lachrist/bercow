import { writeSync as write } from "node:fs";
import { ESLint } from "eslint";

export default async (config) => {
  config = {
    formatter: "stylish",
    ...config,
  };
  const eslint = new ESLint();
  const formatter = await eslint.loadFormatter(config.formatter);
  return {
    lint: async ({ path, content }, { logSubtitle }) => {
      logSubtitle(`linting with eslint ${path}`);
      const results = await eslint.lintText(content, { filePath: path });
      const message = await formatter.format(results);
      if (message !== "") {
        write(1, message, "utf8");
      }
      if (results[0].errorCount > 0) {
        throw new Error("eslint failure");
      } else {
        return content;
      }
    },
  };
};
