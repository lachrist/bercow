export const isNotNull = (any) => any !== null;

const getLink = ({ link }) => link;

const getLint = ({ lint }) => lint;

const getTest = ({ test }) => test;

export const linkNothing = (path, _infos) => [path];

export const lintNothing = ({ content }, _infos) => content;

export const testNothing = (_files, _infos) => {};

const combineLink = (linkers) => async (path, infos) => {
  const paths = [];
  for (const link of linkers) {
    paths.push(...(await link(path, infos)));
  }
  return paths;
};

const combineLint =
  (linters) =>
  async ({ path, content }, infos) => {
    for (const lint of linters) {
      content = await lint({ path, content }, infos);
    }
    return content;
  };

const combineTest = (testers) => async (files, infos) => {
  for (const test of testers) {
    await test(files, infos);
  }
};

const compile = (plugins, getClosure, nothing, combine) => {
  const closures = plugins.map(getClosure).filter(isNotNull);
  if (closures.length === 0) {
    return nothing;
  } else if (closures.length === 1) {
    return closures[0];
  } else {
    return combine(closures);
  }
};

export const loadPluginAsync = async (path, options, home) => ({
  link: null,
  lint: null,
  test: null,
  ...(await (await import(path)).default(options, home)),
});

export const combinePluginArray = (plugins) => ({
  link: compile(plugins, getLink, linkNothing, combineLink),
  lint: compile(plugins, getLint, lintNothing, combineLint),
  test: compile(plugins, getTest, testNothing, combineTest),
});
