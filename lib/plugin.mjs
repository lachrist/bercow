import {isNotNull} from "./util.mjs";

const getLink = ({ link }) => link;

const getLint = ({ lint }) => lint;

const getTest = ({ test }) => test;

export const linkNothing = (path, _ordering) => [path];

export const lintNothing = ({ content }, _ordering) => content;

export const testNothing = (_files, _ordering) => {};

const combineLink = (linkers) => async (path, progress) => {
  const paths = [];
  for (const link of linkers) {
    paths.push(...(await link(path, progress)));
  }
  return paths;
};

const combineLint =
  (linters) =>
  async ({ path, content }, progress) => {
    for (const lint of linters) {
      content = await lint({ path, content }, progress);
    }
    return content;
  };

const combineTest = (testers) => async (files, progress) => {
  for (const test of testers) {
    await test(files, progress);
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

export const compilePluginAsync = async (path, options) => ({
  link: null,
  lint: null,
  test: null,
  ...(await (await import(path))(options)),
});

export const combinePluginArray = (plugins) => ({
  link: compile(plugins, getLink, linkNothing, combineLink),
  lint: compile(plugins, getLint, lintNothing, combineLint),
  test: compile(plugins, getTest, testNothing, combineTest),
});
