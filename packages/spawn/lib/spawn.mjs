import { spawn } from "node:child_process";

export const spawnAsync = (logParagraph, command, argv, options) =>
  new Promise((resolve, reject) => {
    options = {
      encoding: "utf8",
      ...options,
      stdio: "pipe",
    };
    const child = spawn(command, argv, options);
    child.stdout.setEncoding(options.encoding);
    child.stderr.setEncoding(options.encoding);
    child.stdout.on("data", logParagraph);
    child.stderr.on("data", logParagraph);
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
