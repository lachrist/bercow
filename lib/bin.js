const minimist = require("minimist");
const Path = require("path");
const { turtle, TestFailureError, TestCoverageError } = require("./main.js");

const options = {
  help: false,
  cov: 100,
  ext: "js",
  dir: ".",
  ...minimist(process.argv.slice(2)),
};

if (options.help) {
  process.stderr.write(
    [
      "usage: npx test-turtle",
      "  --ext: the file extension used by the project, it",
      "         is curently not possible to mix extensions",
      "  --cov: the minimum coverage threshold (0, 100)",
      "  --dir: the root directory to start testing",
    ].join("\n"),
    "utf8",
  );
} else {
  options.cov = String(options.cov);
  options.cov = [
    "--check-coverage",
    `--branches=${options.cov}`,
    `--functions=${options.cov}`,
    `--lines=${options.cov}`,
    `--statements=${options.cov}`,
  ].join(" ");
  try {
    turtle(
      Path.dirname(options.dir),
      Path.basename(options.dir),
      null,
      options,
    );
  } catch (error) {
    if (
      error instanceof TestFailureError ||
      error instanceof TestCoverageError
    ) {
      process.stderr.write(`${error.message}${"\n"}`);
      process.exitCode = 1;
    } else {
      throw error;
    }
  }
}
