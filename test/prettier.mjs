import { default as Prettier } from "prettier";

const { format: formatPrettier, resolveConfig: resolvePrettierConfigAsync } =
  Prettier;

const default_config = {
  "prettier-options": null,
};

export default async (config, _home) => {
  config = { ...default_config, ...config };
  return {
    lint: async ({ path, content }, _ordering) =>
      formatPrettier(content, {
        ...(config["prettier-options"] === null
          ? await resolvePrettierConfigAsync(path)
          : config["prettier-options"]),
        filepath: path,
      }),
  };
};
