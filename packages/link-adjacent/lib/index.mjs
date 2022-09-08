import { relative as relativizePath } from "node:path";

export default async (config, _home) => {
  config = {
    "additional-extension": "test",
    "final-extension": null,
    ...config,
  };
  return {
    link: async (path, { logTitle }) => {
      logTitle(`${relativizePath(process.cwd(), path)}`);
      const segments = path.split(".");
      if (config["final-extension"] !== null) {
        segments.pop();
        segments.push(config["final-extension"]);
      }
      segments.splice(-1, 0, config["additional-extension"]);
      return [path, segments.join(".")];
    },
  };
};
