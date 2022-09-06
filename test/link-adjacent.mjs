
const default_config = {
  "additional-extension": "test",
  "extension": null,
};

export const link = async (config) => {
  config = {...default_config, ...config};
  return async (path, _ordering) => {
    const segments = path.split(".");
    if (config.extension !== null) {
      segments.pop();
      segments.push(config.extension);
    }
    segments.splice(-1, 0, config["additional-extension"]);
    return [path, segments.join(".")];
  };
};
