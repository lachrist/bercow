import { join as joinPath } from "node:path";
import { unlinkSync, readFileSync, statSync } from "node:fs";
import Chalk from "chalk";
import { loadList, saveListEntry } from "./list.mjs";
import { hashFileArray } from "./hash.mjs";

export { spawnSync } from "./spawn.mjs";

const default_configuration = {
  "achievements-cache-file": ".achievements",
  "progress-cache-file": ".progress",
  "ordering-filename": ".ordering",
  encoding: "utf8",
  resources: null,
  achieve: null,
  progress: null,
};

export const main = (configuration) => {
  configuration = {
    ...default_configuration,
    ...configuration,
  };
  const achievements = new Set(
    loadList(configuration["achievements-cache-file"], configuration.encoding),
  );
  const progress = loadList(
    configuration["progress-cache-file"],
    configuration.encoding,
  );
  unlinkSync(configuration["progress-cache-file"]);
  orderDirectory(
    configuration.root,
    progress[Symbol.iterator](),
    (path) => achieveFile(path, achievements, configuration),
    configuration,
  );
};

const achieveFile = (path, achievements, configuration) => {
  let content = readFileSync(path);
  if (!achievements.has(hashFileArray([{ path, content }]))) {
    configuration.achieve(path);
    content = readFileSync(path);
    const achievement = hashFileArray([{ path, content }]);
    if (!achievements.has(achievement)) {
      achievements.add(achievement);
      saveListEntry(
        configuration["achievements-cache-file"],
        achievement,
        configuration.encoding,
      );
    }
  }
  return { path, content };
};

const orderDirectory = (directory, iterator, achieve, configuration) => {
  for (const filename of loadList(
    configuration["ordering-filename"],
    configuration.encoding,
  )) {
    const path = joinPath(directory, filename);
    if (statSync(path).isDirectory()) {
      orderDirectory(path, iterator, achieve, configuration);
    } else {
      console.log(`${Chalk.blue(path)} ...`);
      const progression = hashFileArray(
        [path].concat(configuration.resources(path)).map(achieve),
      );
      let step = iterator.next();
      if (step.value === progression) {
        console.log(Chalk.blue("Memoized"));
      } else {
        while (!step.done) {
          step = iterator.next();
        }
        configuration.progress(path);
        console.log(Chalk.green("Success"));
      }
      saveListEntry(
        configuration["progress-cache-file"],
        progression,
        configuration.encoding,
      );
    }
  }
};
