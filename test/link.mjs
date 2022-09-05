export const link = async (path) => {
  const segments = path.split(".");
  segments.splice(-1, 0, "test");
  return [path, segments.join(".")];
};
