import * as ChildProcess from "child_process";
import { assertReject } from "./assert.mjs";

export const spawnAsync = (command, args) =>
  new Promise((resolve, reject) => {
    const child = ChildProcess.spawn(command, args, {
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (status, signal) => {
      assertReject(
        reject,
        signal === null,
        "command %o %o was killed with %s",
        command,
        args,
        signal,
      );
      resolve(status === 0);
    });
  });
