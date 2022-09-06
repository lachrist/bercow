
import { default as Prettier } from "prettier";

const { format: formatPrettier, resolveConfig: resolvePrettierConfigAsync } =
  Prettier;

const default_config = {
  "prettier-options": null,
};

export const lint = async (config) => {
  config = {...default_config, ...config};
  return async ({ path, content }) => formatPrettier(source, {
    ... config["prettier-options"] === null
      ? await resolvePrettierConfigAsync(path)
      : config["prettier-options"],
    filepath: path,
  }),
};
