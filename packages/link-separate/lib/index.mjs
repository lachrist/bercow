import { join as joinPath, relative as relativizePath } from "node:path";

export default async (config, home) => {
  config = {
    "home-directory": home,
    "test-directory": "test",
    ...config,
  };
  return {
    link: async (path, { logTitle }) => {
      logTitle(`${relativizePath(process.cwd(), path)}`);
      return [
        path,
        joinPath(
          config["home-directory"],
          config["test-directory"],
          relativizePath(config["home-directory"], path),
        ),
      ];
    },
  };
};