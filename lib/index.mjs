import { join as joinPath } from "node:path";
import {
  unlink as unlinkAsync,
  readFile as readFileAsync,
  writeFile as writeFileAsync,
  stat as statAsync,
} from "node:fs/promises";
import Chalk from "chalk";
import { loadListAsync, saveListEntryAsync } from "./list.mjs";
import { hashFileArray } from "./hash.mjs";

export { spawnAsync } from "./spawn.mjs";

const { blue: blueChalk, green: greenChalk } = Chalk;

const default_configuration = {
  root: process.cwd(),
  "achievements-cache-file": ".achievements",
  "progress-cache-file": ".progress",
  "ordering-filename": ".ordering",
  encoding: "utf8",
  resourcesAsync: null,
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
  const file = {
    path,
    content: await readFileAsync(path),
  };
  const achievement = hashFileArray([file]);
  if (achievements.has(achievement)) {
    return file;
  } else {
    const updated_file = {
      path,
      content: await configuration.achieveAsync(file),
    };
    const updated_achievement = hashFileArray([updated_file]);
    if (updated_achievement !== achievement) {
      await writeFileAsync(path, updated_file.content);
      if (!achievements.has(updated_achievement)) {
        achievements.add(updated_achievement);
        await saveListEntryAsync(
          configuration["achievements-cache-file"],
          updated_achievement,
          configuration.encoding,
        );
      }
    }
    return updated_file;
  }
};

const orderDirectoryAsync = async (
  directory,
  iterator,
  achievements,
  configuration,
) => {
  for (const filename of await loadListAsync(
    joinPath(directory, configuration["ordering-filename"]),
    configuration.encoding,
  )) {
    const path = joinPath(directory, filename);
    if ((await statAsync(path)).isDirectory()) {
      await orderDirectoryAsync(path, iterator, achievements, configuration);
    } else {
      console.log(blueChalk(`${path} ...`));
      const files = [];
      for (const resource of await configuration.resourcesAsync(path)) {
        files.push(
          await achieveFileAsync(resource, achievements, configuration),
        );
      }
      const progression = hashFileArray(files);
      let step = iterator.next();
      if (step.value === progression) {
        console.log(blueChalk("Memoized"));
      } else {
        while (!step.done) {
          step = iterator.next();
        }
        await configuration.progressAsync(files);
        console.log(greenChalk("Success"));
      }
      await saveListEntryAsync(
        configuration["progress-cache-file"],
        progression,
        configuration.encoding,
      );
    }
  }
};
