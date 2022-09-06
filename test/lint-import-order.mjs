import { resolve as resolvePath } from "node:path";
import { parse as parseBabel } from "@babel/parser";
import { generate as generateBabel } from "@babel/generator";

const NODE_SOURCE_RANKING = 1;
const MODULE_SOURCE_RANKING = 2;
const INTERNAL_SOURCE_RANKING = 3;

const default_config = {
  "babel-parser-options": {},
  "babel-generator-options": {
    comments: true,
    retainFunctionParens: true,
    retainLines: true,
    compact: false,
    concise: false,
    minified: false,
  },
};

const isImport = (statement) =>
  statement.type === "ImportDeclaration" ||
  (statement.type === "ExportNamedDeclaration" && statement.source !== null) ||
  statement.type === "ExportAllDeclaration";

const getSourceRanking = (source) => {
  if (source[0] === "/" || source[0] === ".") {
    return INTERNAL_SOURCE_RANKING;
  } else if (source.startsWith(":node")) {
    return NODE_SOURCE_RANKING;
  } else {
    return MODULE_SOURCE_RANKING;
  }
};

const getSourceOrder = (source, base, ordering) => {
  const index = ordering.indexOf(resolvePath(source, base));
  if (index === -1) {
    throw new Error("Missing");
  } else {
    return index;
  }
};

const splitProgramBody = (statements) => {
  const iterator = statements[Symbol.iterator]();
  let step = iterator.next();
  const head = [];
  while (!step.done && isImport(step.value)) {
    head.push(step.value);
    step = iterator.next();
  }
  const body = [];
  while (!step.done) {
    if (isImport(step.value)) {
      throw new Error(
        "Import statement should appear before any other statements",
      );
    }
    body.push(step.value);
  }
  return { head, body };
};

const compareImportStatement = (statement1, statement2, base, ordering) => {
  const {
    source: { value: source1 },
  } = statement1;
  const {
    source: { value: source2 },
  } = statement2;
  const ranking1 = getSourceRanking(source1);
  const ranking2 = getSourceRanking(source2);
  if (ranking1 !== ranking2) {
    return ranking1 - ranking2;
  } else if (ranking1 !== INTERNAL_SOURCE_RANKING) {
    return 0;
  } else {
    return (
      getSourceOrder(source1, base, ordering) -
      getSourceOrder(source2, base, ordering)
    );
  }
};

const isEqualShallowArray = (array1, array2) => {
  if (array1.length !== array2.length) {
    return false;
  } else {
    const { length } = array1;
    for (let index = 0; index < length; index += 1) {
      if (array1[index] !== array2[index]) {
        return false;
      }
    }
    return true;
  }
};

export default async (config) => {
  config = { ...default_config, ...config };
  return {
    lint: async (file, ordering) => {
      const program = parseBabel(file.content, {
        sourceFilename: file.path,
        ...config["babel-parser-options"],
      });
      const { head, body } = splitProgramBody(program.body);
      if (config.fix) {
        const sorted_head = head.slice();
        sorted_head.sort((statement1, statement2) =>
          compareImportStatement(statement1, statement2, ordering),
        );
        if (isEqualShallowArray(head, sorted_head)) {
          return file;
        } else {
          return {
            path: file.path,
            content: generateBabel({
              ...program,
              body: [...sorted_head, ...body],
            }),
          };
        }
      } else {
        const iterator = head[Symbol.iterator]();
        let step1 = iterator.next();
        let step2 = iterator.next();
        while (!step2.done) {
          if (compareImportStatement(step1.value, step2.value, ordering) > 0) {
            const {
              value: {
                loc: { line: line1, column: column1 },
                source: { value: source1 },
              },
            } = step1;
            const {
              value: {
                loc: { line: line2, column: column2 },
                source: { value: source2 },
              },
            } = step2;
            throw new Error(
              `Ordering mismatch between ${JSON.stringify(
                source1,
              )} at ${line1}:${column1} and ${JSON.stringify(
                source2,
              )} at ${line2}:${column2}`,
            );
          }
          step1 = step2;
          step2 = iterator.next();
        }
        return file;
      }
    },
  };
};
