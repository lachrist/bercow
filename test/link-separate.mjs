
import {join as joinPath, relative as toRelativePath} from "node:path";

const default_config = {
  "home-directory": process.cwd(),
  "test-directory": "test",
};

export const link = async (config) => {
  config = {...default_config, ...config};
  return async (path, _ordering) => [
    path,
    joinPath(
      config["home-directory"],
      config["test-directory"],
      toRelativePath(config["home-directory"], path),
    ),
  ];
};
