import { join as joinPath, relative as toRelativePath } from "node:path";

const default_config = {
  "home-directory": process.cwd(),
  "test-directory": "test",
};

export default async (config) => {
  config = { ...default_config, ...config };
  return {
    link: async (path, _ordering) => [
      path,
      joinPath(
        config["home-directory"],
        config["test-directory"],
        toRelativePath(config["home-directory"], path),
      ),
    ],
  };
};
