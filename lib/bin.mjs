#!/usr/bin/env node

import minimist from "minimist";
import { mainAsync } from "../lib/main.mjs";

mainAsync(minimist(process.argv.slice(2)));
