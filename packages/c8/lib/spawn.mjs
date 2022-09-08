import { spawn } from "node:child_process";

const options = { stdio: "inherit" };

// export const spawn = (command, ...argv) => {
//   const { error = null, signal, status } = spawnSync(command, argv, options);
//   if (error !== null) {
//     throw error;
//   } else if (signal !== null) {
//     throw new Error(`${command} ${argv.join(" ")} killed with ${signal}`);
//   } else if (status !== 0) {
//     throw new Error(
//       `${command} ${argv.join(" ")} failed with ${String(status)}`,
//     );
//   }
// };

export const spawnAsync = (command, ...argv) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, argv, options);
    child.on("error", reject);
    child.on("exit", (status, signal) => {
      if (signal !== null) {
        reject(new Error(`${command} ${argv.join(" ")} killed with ${signal}`));
      } else if (status !== 0) {
        reject(
          new Error(
            `${command} ${argv.join(" ")} failed with ${String(status)}`,
          ),
        );
      } else {
        resolve(undefined);
      }
    });
  });
