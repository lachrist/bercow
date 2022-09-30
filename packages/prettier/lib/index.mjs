import { default as Prettier } from "prettier";

const { format: formatPrettier, resolveConfig: resolvePrettierConfigAsync } =
  Prettier;

export default async (config, _home) => {
  config = {
    "prettier-options": null,
    ...config,
  };
  const options =
    typeof config["prettier-options"] === "string"
      ? await resolvePrettierConfigAsync(config["prettier-options"])
      : config["prettier-options"];
  return {
    lint: async ({ path, content }, { logSubtitle }) => {
      logSubtitle(`formatting with prettier ${path}`);
      return formatPrettier(content, {
        ...(options === null
          ? await resolvePrettierConfigAsync(path)
          : options),
        filepath: path,
      });
    },
  };
};
