export default async (config) => {
  config = {
    "test-directory": "test",
    ...config,
  };
  return {
    link: async (path, { logTitle }) => {
      logTitle(path);
      return [path, `${config["test-directory"]}/${path}`];
    },
  };
};
