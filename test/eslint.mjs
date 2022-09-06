
import { ESLint } from "eslint";

export const lint = async (_config) => {
  const eslint = new ESLint();
  const formatter = await eslint.loadFormatter("stylish");
  return async ({ path, content }) => {
    const results = await eslint.lintText(source, { filePath: path });
    const message = await formatter.format(results);
    if (message !== "") {
      console.log(message);
    }
    if (results[0].errorCount > 0) {
      throw new Error("eslint failure");
    } else {
      return content;
    }
  };
};
