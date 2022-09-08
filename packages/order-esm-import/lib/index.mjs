import {
  resolve as resolvePath,
  dirname as getDirectory,
  relative as relativizePath,
} from "node:path";
import { parse as parseBabel } from "@babel/parser";
import BabelGenerator from "@babel/generator";

const { default: generateBabel } = BabelGenerator;

const { stringify: stringifyJSON } = JSON;

const default_babel_parser_options = {
  sourceType: "module",
  // allowAwaitOutsideFunction: true,
};

const default_babel_generator_options = {
  comments: true,
  retainFunctionParens: true,
  retainLines: true,
  compact: false,
  concise: false,
  minified: false,
};

const isImport = (statement) =>
  statement.type === "ImportDeclaration" ||
  (statement.type === "ExportNamedDeclaration" && statement.source !== null) ||
  statement.type === "ExportAllDeclaration";

const orderImportStatement = (statement, base, ordering, index) => {
  const {
    source: { value: source },
  } = statement;
  const resolved_source =
    source[0] === "." ? resolvePath(base, source) : source;
  const order = ordering.indexOf(resolved_source);
  if (order > index) {
    throw new Error(
      `File should not be imported before being tested: ${stringifyJSON(
        resolved_source,
      )}`,
    );
  } else {
    return { order, statement };
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
      const {
        value: {
          loc: {
            start: { line, column },
          },
        },
      } = step;
      throw new Error(
        `Import statement should appear before any other statements at ${line}:${column}`,
      );
    }
    body.push(step.value);
    step = iterator.next();
  }
  return { head, body };
};

const isEqualShallowArray = (array1, array2) => {
  /* c8 ignore start */ if (array1.length !== array2.length) {
    return false;
  } /* c8 ignore stop */ else {
    const { length } = array1;
    for (let index = 0; index < length; index += 1) {
      if (array1[index] !== array2[index]) {
        return false;
      }
    }
    return true;
  }
};

const getStatement = ({ statement }) => statement;

const removeLocation = ({ loc: _loc, ...rest }) => rest;

const compareOrderedStatement = ({ order: order1 }, { order: order2 }) =>
  order1 - order2;

export default async (config, _home) => {
  config = {
    "babel-generator-options": null,
    "babel-parser-options": null,
    fix: true,
    ...config,
  };
  const babel_generator_options = {
    ...default_babel_generator_options,
    ...config["babel-generator-options"],
  };
  const babel_parser_options = {
    ...default_babel_parser_options,
    ...config["babel-parser-options"],
  };
  return {
    lint: async ({ path, content }, { log, ordering, index }) => {
      log(
        `  > ordering esm imports of ${relativizePath(
          process.cwd(),
          path,
        )} ...\n`,
      );
      const { program } = parseBabel(content, babel_parser_options);
      const { head, body } = splitProgramBody(program.body);
      const base = getDirectory(path);
      const ordered_head = head.map((statement) =>
        orderImportStatement(statement, base, ordering, index),
      );
      if (config.fix) {
        const sorted_ordered_head = ordered_head.slice();
        sorted_ordered_head.sort(compareOrderedStatement);
        const sorted_head = sorted_ordered_head.map(getStatement);
        if (isEqualShallowArray(head, sorted_head)) {
          return content;
        } else {
          return generateBabel(
            {
              ...program,
              body: [...sorted_head.map(removeLocation), ...body],
            },
            babel_generator_options,
          ).code;
        }
      } else {
        const iterator = ordered_head[Symbol.iterator]();
        let step1 = iterator.next();
        let step2 = iterator.next();
        while (!step2.done) {
          if (compareOrderedStatement(step1.value, step2.value) > 0) {
            const {
              value: {
                statement: {
                  loc: {
                    start: { line: line1, column: column1 },
                  },
                  source: { value: source1 },
                },
              },
            } = step1;
            const {
              value: {
                statement: {
                  loc: {
                    start: { line: line2, column: column2 },
                  },
                  source: { value: source2 },
                },
              },
            } = step2;
            throw new Error(
              `Ordering mismatch between ${stringifyJSON(
                source1,
              )} at ${line1}:${column1} and ${stringifyJSON(
                source2,
              )} at ${line2}:${column2}`,
            );
          }
          step1 = step2;
          step2 = iterator.next();
        }
        return content;
      }
    },
  };
};
