#!/usr/bin/env node

import { runBercowAsync } from "../lib/cli.mjs";

process.exitStatus = await runBercowAsync(process.argv.slice(2));
