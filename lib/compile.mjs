const { isArray } = Array;

const linkNothing = (path, _ordering) => [path];

const lintNothing = ({ content }, _ordering) => content;

const testNothing = (_files, _ordering) => {};

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

const generateCompile = (nothing, combine) => (either) => {
  if (isArray(either)) {
    if (either.length === 0) {
      return nothing;
    } else if (either.length === 1) {
      return either[0];
    } else {
      return combine(either);
    }
  } else {
    return either;
  }
};

export const compileLink = generateCompile(linkNothing, combineLink);

export const compileLint = generateCompile(lintNothing, combineLint);

export const compileTest = generateCompile(testNothing, combineTest);
