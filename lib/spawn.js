const ChildProcess = require("child_process");

const { assert } = require("./assert.js");

class KillSpawnError extends Error {}

class ExitSpawnError extends Error {}

exports.KillSpawnError = KillSpawnError;

exports.ExitSpawnError = ExitSpawnError;

exports.spawn = (command, args) => {
  const { signal, status } = ChildProcess.spawnSync(command, args, {
    stdio: "inherit",
  });
  assert(
    signal === null,
    KillSpawnError,
    `%s %j killed with %s`,
    command,
    args,
    signal,
  );
  assert(
    status === 0,
    ExitSpawnError,
    `%s %j exited with %i`,
    command,
    args,
    status,
  );
};
