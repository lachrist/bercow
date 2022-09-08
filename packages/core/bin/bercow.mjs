import { runBercowAsync } from "../lib/cli.mjs";

Error.stackTraceLimit = Infinity;

process.exitStatus = await runBercowAsync(process.argv.slice(2), process.cwd());
