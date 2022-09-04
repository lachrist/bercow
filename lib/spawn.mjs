import { spawnSync } from "node:child_process";

const options = { stdio: "inherit" };

export const spawn = (command, ...argv) => {
  const { error = null, signal, status } = spawnSync(command, argv, options);
  if (error !== null) {
    throw error;
  } else if (signal !== null) {
    throw new Error(`${command} ${argv.join(" ")} killed with ${signal}`);
  } else if (status !== 0) {
    throw new Error(
      `${command} ${argv.join(" ")} failed with ${String(status)}`,
    );
  }
};
