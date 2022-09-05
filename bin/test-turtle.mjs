import { default as minimist } from "minimist";
import { testTurtle as testTurtleAsync } from "../lib/index.mjs";

const options = {
  plugin: "test-turtle-prettier-eslint-c8",
  ...minimist(process.argv.slice(2)),
};

await testTurtleAsync(...options, ...(await import(options.plugin)));
