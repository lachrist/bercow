import { join as joinPath } from "node:path";
import {
  unlink as unlinkAsync,
  readFile as readFileAsync,
  stat as statAsync,
} from "node:fs/promises";
import Chalk from "chalk";
import { loadListAsync, saveListEntryAsync } from "./list.mjs";
import { hashFileArray } from "./hash.mjs";

export { spawnAsync } from "./spawn.mjs";

const default_configuration = {
  "achievements-cache-file": ".achievements",
  "progress-cache-file": ".progress",
  "ordering-filename": ".ordering",
  encoding: "utf8",
  resources: null,
  achieveAsync: null,
  progressAsync: null,
};

export const mainAsync = async (configuration) => {
  configuration = {
    ...default_configuration,
    ...configuration,
  };
  const achievements = await loadListAsync(
    configuration["achievements-cache-file"],
    configuration.encoding,
  );
  const progress = await loadListAsync(
    configuration["progress-cache-file"],
    configuration.encoding,
  );
  try {
    await unlinkAsync(configuration["progress-cache-file"]);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
  await orderDirectoryAsync(
    configuration.root,
    progress[Symbol.iterator](),
    new Set(achievements),
    configuration,
  );
};

const achieveFileAsync = async (path, achievements, configuration) => {
  let content = await readFileAsync(path);
  if (!achievements.has(hashFileArray([{ path, content }]))) {
    await configuration.achieveAsync(path);
    content = await readFileAsync(path);
    const achievement = hashFileArray([{ path, content }]);
    if (!achievements.has(achievement)) {
      achievements.add(achievement);
      await saveListEntryAsync(
        configuration["achievements-cache-file"],
        achievement,
        configuration.encoding,
      );
    }
  }
  return { path, content };
};

const orderDirectoryAsync = async (
  directory,
  iterator,
  achievements,
  configuration,
) => {
  for (const filename of await loadListAsync(
    configuration["ordering-filename"],
    configuration.encoding,
  )) {
    const path = joinPath(directory, filename);
    if ((await statAsync(path)).isDirectory()) {
      await orderDirectoryAsync(path, iterator, achievements, configuration);
    } else {
      console.log(`${Chalk.blue(path)} ...`);
      const files = [];
      for (const path of [path].concat(configuration.resources(path))) {
        files.push(await achieveFileAsync(path, achievements, configuration));
      }
      const progression = hashFileArray(files);
      let step = iterator.next();
      if (step.value === progression) {
        console.log(Chalk.blue("Memoized"));
      } else {
        while (!step.done) {
          step = iterator.next();
        }
        await configuration.progressAsync(path);
        console.log(Chalk.green("Success"));
      }
      await saveListEntryAsync(
        configuration["progress-cache-file"],
        progression,
        configuration.encoding,
      );
    }
  }
};
